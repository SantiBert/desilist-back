import {Event, Prisma} from '@prisma/client';
import prisma from '@/db';
import {GetAllListing, GetAllListingCsv} from '@/interfaces/listing.interface';
import {LISTING_STATUS} from '@/constants/listingStatus';
import {diffToNowInDaysForCsv, getISONow} from '@/utils/time';
import {Parser} from 'json2csv';
import config from '@config';

export class EventsService {
  public event = prisma.event;
  public listing = prisma.listing

  public async find(params?): Promise<Partial<GetAllListing>> {
    const eventData = {
      events: [],
      highlighted: 0,
      total: 0,
      cursor: 0,
      pages: 0
    };
    // select
    const select = {
      id: true,
      title: true,
      description: true,
      has_banner: true,
      start_at: true,
      end_at: true,
      timezone: {
        select: {
          id: true,
          abbreviation: true,
          name: true,
          utc_offset: true
        }
      },
      website: true,
      highlighted: true,
      event_organizer: true,
      subcategory: {
        select: {
          id: true,
          name: true,
          category: {select: {id: true, name: true}}
        }
      },
      publisher: {
        select: {
          id: true,
          full_name: true,
          photo: true,
          photo_json: true
        }
      },
      status: {
        select: {
          id: true,
          name: true
        }
      },
      contact_information: true,
      has_ticket: true,
      ticket_close_time: true,
      Ticket_type: {
        select: {
          id: true,
          type: {
            select: {
              id: true,
              name: true
            }
          },
          name: true,
          quantity_avaible: true,
          unit_price: true,
          max_quantity_order: true,
          description: true,
          valid_for: true
        }
      },
      LiveStreaming: {
        select: {
          id: true,
          url: true,
          description: true,
          media: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      EventBookmark: {
        select: {
          user_id: true,
          user: {
            select: {
              id: true,
              full_name: true,
              email: true
            }
          }
        }
      },
      venue_location: {
        select: {
          geometry_point: true,
          address_description: true,
          venue_name: true,
          srid: true,
          place_id: true,
          city: true,
          state: true,
          zipcode: true,
          country: true,
          address: true
        }
      },
      eventPackage: true,
      terms_event: true,
      created_at: true,
      paused_at: true
    };

    // where
    const where = {deleted_at: null, paused_at: null};
    const subWhere = [];
    let take = 10;
    if (params) {
      params.paused_at && delete where['paused_at'];
      params.user_id ? (where['publisher_id'] = params.user_id) : null;
      params.category_id
        ? (where['subcategory'] = {category_id: Number(params.category_id)})
        : null;
      // multiples categories
      /*
      params.subcategory_id
        ? (where['subcategory_id'] = Number(params.subcategory_id))
        : null;
      */
      if (params.subcategory_id) {
        if (params.subcategory_id.split(',').length > 1) {
          const categories = params.subcategory_id
            .split(',')
            .map((value) => Number(value));
          where['subcategory_id'] = {in: categories};
        } else {
          where['subcategory_id'] = Number(params.subcategory_id);
        }
      }
      /*
      if (params.promoted) {
        if (params.promoted === 'true') {
          where['listing_packages'] = {
            some: {
              promote_package_id: {not: null},
              active: true,
              paused_at: null
            }
          };
        } else {
          where['listing_packages'] = {
            none: {
              promote_package_id: {not: null},
              active: true,
              paused_at: null
            }
          };
        }
      }
      */
      if (params.promoted) {
        if (params.promoted === 'true') {
          where['eventPackage'] = {
            some: {
              promote_package_id: {not: null},
              active: true,
              paused_at: null
            }
          };
        } else {
          where['eventPackage'] = {
            none: {
              promote_package_id: {not: null},
              active: true,
              paused_at: null
            }
          };
        }
      }

      params.highlighted ? (where['highlighted'] = true) : null;
      if (Number(params.status_id) !== -1) {
        where['status_id'] = params.status_id
          ? Number(params.status_id)
          : LISTING_STATUS.ACTIVE;
      }
      if (params.search) {
        subWhere.push({title: {contains: params.search, mode: 'insensitive'}});
        /*
        subWhere.push({
          publisher: {full_name: {contains: params.search, mode: 'insensitive'}}
        });
        */
      }
      subWhere.length > 0 ? (where['OR'] = subWhere) : null;
    }

    // take
    if (params?.take) {
      take = Number(params.take);
    }

    // query
    const query = {
      select: select
    };

    // cursor
    if (params?.cursor && !params.skip) {
      query['cursor'] = {
        id: Number(params.cursor)
      };
      query['skip'] = 1;
    }

    // skip
    if (params?.skip && !params.cursor) {
      query['skip'] = Number(params.skip);
    }

    if (where) {
      query['where'] = where;
    }

    if (take > 0) {
      query['take'] = take;
    }
    // order
    let order,
      criteria = 'id';
    if (params?.order) {
      order = params.order;
    }
    if (params?.order_by) {
      criteria = params.order_by;
    }
    // checks if order is an Array
    if (params?.order_by && params?.order_by.split(',').length > 1) {
      const orderValues = params.order_by.split(',').map((value) => {
        const order = value.includes('!') ? 'asc' : 'desc';
        const parsedValue = value.includes('!')
          ? value.replace('!', '')
          : value;
        return {[parsedValue]: order};
      });
      query['orderBy'] = orderValues;
    } else {
      query['orderBy'] = {
        [criteria]: order ? order : 'desc'
      };
    }

    eventData.events = await this.event.findMany(query);
    // total highlighted
    // listingData.highlighted = await this.event.count({
    //   where: {...where, highlighted: true}
    // });
    // total results
    eventData.total = await this.event.count({where: where});
    // total pages
    eventData.pages = Math.ceil(Number(eventData.total / take));
    // update lastCursor
    const lastResults = eventData.events[eventData.events.length - 1];
    if (lastResults) {
      eventData.cursor = lastResults.id;
    }

    return eventData;
  }

  public async findById(id: number): Promise<Partial<Event> | null> {
    return await this.event.findFirst({
      select: {
        id: true,
        title: true,
        description: true,
        has_banner: true,
        start_at: true,
        end_at: true,
        timezone: {
          select: {
            id: true,
            abbreviation: true,
            name: true,
            utc_offset: true
          }
        },
        website: true,
        highlighted: true,
        event_organizer: true,
        subcategory: {
          select: {
            id: true,
            name: true,
            category: {select: {id: true, name: true}}
          }
        },
        publisher: {
          select: {
            id: true,
            full_name: true,
            photo: true,
            photo_json: true
          }
        },
        publisher_id: true,
        status_id: true,
        status: {
          select: {
            id: true,
            name: true
          }
        },
        contact_information: true,
        has_ticket: true,
        ticket_close_time: true,
        Ticket_type: {
          select: {
            id: true,
            type: {
              select: {
                id: true,
                name: true
              }
            },
            name: true,
            quantity_avaible: true,
            unit_price: true,
            max_quantity_order: true,
            description: true,
            valid_for: true,
            active: true,
            Ticket:{
              select:{
                qr_status:true,
              }
            }
          }
        },
        LiveStreaming: {
          select: {
            id: true,
            url: true,
            description: true,
            media: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        venue_location: {
          select: {
            geometry_point: true,
            address_description: true,
            venue_name: true,
            srid: true,
            place_id: true,
            city: true,
            state: true,
            zipcode: true,
            country: true,
            address: true
          }
        },
        eventPackage: {
          select: {
            id: true,
            promote_package_id: true,
            active: true,
            paused_at: true,
            promote_package: {
              select: {
                id: true,
                name: true,
                duration: true,
                active: true
              }
            }
          }
        },
        EventBookmark: {
          select: {
            user_id: true,
            user: {
              select: {
                id: true,
                full_name: true,
                email: true
              }
            }
          }
        },
        terms_event: {
          select: {
            event_term: true
          }
        },
        created_at: true,
        paused_at: true
      },
      where: {
        id,
        deleted_at: null
      }
    });
  }

  public async findByUser(
    userId: string,
    params?: any,
    showFlagged?: boolean
  ): Promise<Partial<GetAllListing>> {
    const eventData = {
      events: [],
      highlighted: 0,
      total: 0,
      cursor: 0,
      pages: 0
    };

    //select
    const select = {
      id: true,
      title: true,
      description: true,
      has_banner: true,
      start_at: true,
      end_at: true,
      timezone: {
        select: {
          id: true,
          abbreviation: true,
          name: true,
          utc_offset: true
        }
      },
      website: true,
      highlighted: true,
      event_organizer: true,
      subcategory: {
        select: {
          id: true,
          name: true,
          category: {select: {id: true, name: true}}
        }
      },
      publisher: {
        select: {
          id: true,
          full_name: true,
          photo: true,
          photo_json: true
        }
      },
      status: {
        select: {
          id: true,
          name: true
        }
      },
      contact_information: true,
      has_ticket: true,
      ticket_close_time: true,
      Ticket_type: {
        select: {
          id: true,
          type: {
            select: {
              id: true,
              name: true
            }
          },
          name: true,
          quantity_avaible: true,
          unit_price: true,
          max_quantity_order: true,
          description: true,
          valid_for: true
        }
      },
      LiveStreaming: {
        select: {
          id: true,
          url: true,
          description: true,
          media: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      EventBookmark: {
        select: {
          user_id: true,
          user: {
            select: {
              id: true,
              full_name: true,
              email: true
            }
          }
        }
      },
      venue_location: {
        select: {
          geometry_point: true,
          venue_name: true,
          address_description: true,
          srid: true,
          place_id: true,
          city: true,
          state: true,
          zipcode: true,
          country: true,
          address: true
        }
      },
      terms_event: true,
      created_at: true,
      paused_at: true,
      eventPackage: true
    };
    /*
    if (showFlagged) {
      select['listings_flagged'] = {
        select: {
          new_changes: true
        },
        where: {
          dismissed: false,
          deleted_at: null
        },
        take: 1,
        orderBy: [
          {
            new_changes: Prisma.SortOrder.desc
          }
        ]
      };
    }
    */

    //where
    const where = {
      deleted_at: null,
      publisher_id: userId,
      paused_at: null
    };
    const subWhere = [];
    let take = 10;
    if (params) {
      params.paused_at && delete where['paused_at'];
      params.category_id
        ? (where['subcategory'] = {category_id: Number(params.category_id)})
        : null;
      params.subcategory_id
        ? (where['subcategory_id'] = Number(params.subcategory_id))
        : null;

      if (params.promoted) {
        if (params.promoted === 'true') {
          where['eventPackage'] = {
            some: {
              promote_package_id: {not: null},
              active: true,
              paused_at: null
            }
          };
        } else {
          where['eventPackage'] = {
            none: {
              promote_package_id: {not: null},
              active: true,
              paused_at: null
            }
          };
        }
      }
      params.highlighted ? (where['highlighted'] = true) : null;
      /*
      if (Number(params.status_id) !== -1) {
        where['status_id'] = params.status_id
          ? Number(params.status_id)
          : LISTING_STATUS.ACTIVE;
      }
      */

      if (Number(params.status_id) !== -1) {
        if (params.status_id.split(',').length > 1) {
          const statuses = params.status_id
            .split(',')
            .map((value) => Number(value));
          where['status_id'] = {in: statuses};
        } else {
          where['status_id'] = Number(params.status_id);
        }
      } else {
        where['status_id'] = LISTING_STATUS.ACTIVE;
      }

      if (params.search) {
        subWhere.push({title: {contains: params.search, mode: 'insensitive'}});
        subWhere.push({
          publisher: {full_name: {contains: params.search, mode: 'insensitive'}}
        });
      }
      subWhere.length > 0 ? (where['OR'] = subWhere) : null;
    }

    //take
    if (params.take) {
      take = Number(params.take);
    }

    //query
    const query = {
      select: select
    };

    //cursor
    if (params.cursor && !params.skip) {
      query['cursor'] = {
        id: Number(params.cursor)
      };
      query['skip'] = 1;
    }

    //skip
    if (params.skip && !params.cursor) {
      query['skip'] = Number(params.skip);
    }

    if (where) {
      query['where'] = where;
    }

    if (take > 0) {
      query['take'] = take;
    }

    let order,
      criteria = 'id';
    if (params.order) {
      order = params.order;
    }
    if (params.order_by) {
      criteria = params.order_by;
    }
    query['orderBy'] = {
      [criteria]: order ? order : 'desc'
    };

    eventData.events = await this.event.findMany(query);
    // total highlighted
    // eventData.highlighted = await this.event.count({
    //   where: {...where, highlighted: true}
    // });
    //total results
    eventData.total = await this.event.count({where: where});
    //total pages
    eventData.pages = Math.ceil(Number(eventData.total / take));
    //update lastCursor
    const lastResults = eventData.events[eventData.events.length - 1];
    if (lastResults) {
      eventData.cursor = lastResults.id;
    }

    return eventData;
    /*
    return await this.listing.findMany({
      select: {
        id: true,
        subcategory: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        title: true,
        description: true,
        listing_status: {
          select: {
            id: true,
            name: true
          }
        },
        images: true,
        price: true,
        promoted: true,
        location: true,
        contact: true,
        website: true,
        custom_fields: true
      },
      where: {user_id: userId}
    });
    */
  }

  public async create(data: Event): Promise<Partial<Event> | null> {
    return await this.event.create({
      select: {
        id: true,
        title:true,
        publisher_id: true,
        publisher: {
          select: {
            id: true,
            full_name: true
          }
        },
        subcategory: {
          select: {
            id: true,
            name: true,
            category: {select: {id: true, name: true}}
          }
        }
      },
      data
    });
  }

  public async findByUserForDelete(
    userId: string
  ): Promise<Partial<Event>[] | null> {
    return await this.event.findMany({
      select: {id: true},
      where: {publisher_id: userId}
    });
  }

  public async updateById(
    id: number,
    data: Partial<Event>
  ): Promise<Partial<Event> | null> {
    return await this.event.update({
      select: {id: true},
      data: {...data, updated_at: getISONow()},
      where: {id}
    });
  }

  public async deleteById(id: number): Promise<void> {
    await this.event.update({data: {deleted_at: getISONow()}, where: {id}});
  }

  public async deleteByUserId(userId: string): Promise<void> {
    await this.event.updateMany({
      data: {deleted_at: getISONow()},
      where: {publisher_id: userId}
    });
  }

  public async activeByUserId(userId: string): Promise<void> {
    await this.event.updateMany({
      data: {deleted_at: null},
      where: {publisher_id: userId}
    });
  }

  public async findCsv(): Promise<Partial<GetAllListingCsv>> {
    const listingData = {
      listings: [],
      title: ''
    };
    // select
    const select = {
      id: true,
      title: true,
      description: true,
      images: true,
      listing_status: {
        select: {
          name: true
        }
      },
      price: true,
      location: true,
      contact: true,
      website: true,
      custom_fields: true,
      re_posted: true,
      subcategory: {
        select: {
          id: true,
          name: true,
          category: {select: {id: true, name: true}}
        }
      },
      highlighted: true,
      listing_packages: {
        select: {
          id: true,
          basic_package: {
            select: {id: true, name: true, duration: true}
          },
          promote_package: {
            select: {id: true, name: true, duration: true}
          },
          created_at: true,
          paused_at: true,
          activated_at: true,
          active: true
        },
        orderBy: [{created_at: Prisma.SortOrder.asc}]
      },
      user: {
        select: {
          id: true,
          full_name: true,
          photo: true
        }
      },
      created_at: true,
      paused_at: true
    };

    // where
    const where = {deleted_at: null};
    // query
    const query = {
      select: select
    };

    if (where) {
      query['where'] = where;
    }

    listingData.listings = await this.event.findMany(query);
    const {listings} = listingData;

    for (let i = 0; i < listings.length; ++i) {
      if (
        listings[i].listing_packages &&
        listings[i].listing_packages.filter(
          (listingPackage) =>
            listingPackage.active &&
            listingPackage.paused_at === null &&
            listingPackage.promote_package
        ).length > 0
      ) {
        listings[i]['promoted'] = true;
      } else {
        listings[i]['promoted'] = false;
      }
    }
    const APP_ENV = config.frontend.url;
    const listingsCsvData = [];
    listings.forEach((obj) => {
      const {
        id,
        title,
        user,
        subcategory,
        listing_status: listingStatus,
        price,
        location,
        contact,
        website,
        highlighted,
        listing_packages: listingPackages,
        promoted
      } = obj;
      listingPackages.forEach((pck) => {
        const {
          basic_package: basicPackage,
          promote_package: promotePackage,
          activated_at: activatedAt,
          active
        } = pck;
        const daysNow = activatedAt ? diffToNowInDaysForCsv(activatedAt) : 0;
        const daysOff = basicPackage.duration - Math.abs(daysNow);
        const basicName = basicPackage ? basicPackage.name : basicPackage;
        const promoteName = promotePackage
          ? promotePackage.name
          : promotePackage;
        listingsCsvData.push({
          'Listing Id': id,
          'Listing Title': title,
          Category: subcategory.category.name,
          Subcategory: subcategory.name,
          'Listing Url': `${APP_ENV}/listing-detail/${id}`,
          'Listing Status': listingStatus.name,
          Price: price,
          'Listing Owner': user.full_name,
          Email: contact.email,
          Phone: contact.phone_number,
          City: location.city,
          State: location.state,
          Country: location.country,
          'Zip Code': location.zip_code,
          Website: website,
          'Basic Package': basicName,
          'Promote Package': promoteName,
          Activated_at: activatedAt
            ? activatedAt.toLocaleString('en-US', {hour12: true})
            : null,
          'Days Left': daysOff >= 0 ? daysOff : 0,
          Active: active,
          Promoted: promoted,
          Highlighted: highlighted
        });
      });
    });
    const csvFields = [];
    const parser = new Parser({csvFields});
    const csv = parser.parse(listingsCsvData);

    return csv;
  }

  public async findByOrganizer(
    userId?: string
  ): Promise<Partial<Event>[] | null> {
    let where = null;
    const select = {
      id: true,
      title: true,
      description: true,
      has_banner: true,
      start_at: true,
      end_at: true,
      timezone: {
        select: {
          id: true,
          abbreviation: true,
          name: true,
          utc_offset: true
        }
      },
      website: true,
      highlighted: true,
      event_organizer: true,
      subcategory: {
        select: {
          id: true,
          name: true,
          category: {select: {id: true, name: true}}
        }
      },
      publisher: {
        select: {
          id: true,
          full_name: true,
          photo: true,
          photo_json: true
        }
      },
      status: {
        select: {
          id: true,
          name: true
        }
      },
      contact_information: true,
      has_ticket: true,
      ticket_close_time: true,
      Ticket_type: {
        select: {
          id: true,
          type: {
            select: {
              id: true,
              name: true
            }
          },
          name: true,
          quantity_avaible: true,
          unit_price: true,
          max_quantity_order: true,
          description: true,
          valid_for: true
        }
      },
      LiveStreaming: {
        select: {
          id: true,
          url: true,
          description: true,
          media: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      venue_location: {
        select: {
          geometry_point: true,
          srid: true,
          place_id: true,
          city: true,
          state: true,
          zipcode: true,
          country: true,
          address: true
        }
      },
      terms_event: {
        select: {
          event_term: true
        }
      },
      created_at: true,
      paused_at: true
    };

    const query = {
      select: select
    };

    if (userId) {
      where = {publisher_id: userId};
      query['where'] = where;
    }

    return await this.event.findMany(query);
  }

  public async findActivesBySubCategoryId(
    subCategoryId: number
  ): Promise<Partial<number> | null> {
    const where = {
      status_id: LISTING_STATUS.ACTIVE,
      subcategory_id: subCategoryId,
      deleted_at: null,
      paused_at: null
    };
    return await this.event.count({where});
  }

  
  
  public async findEventsAndListing (params?): Promise<Partial<any>> {
    const { search, take = 10, skip = 0, order, order_by } = params;
    
    const orderBy = order_by 
    ? order_by.split(',').map((field) => {
      const fieldName = field.replace('!', '');
      const order = field.includes('!') ? 'asc' : 'desc';
      return `${fieldName} ${order}`;
    })
  : ['id asc'];

    let query

    if (search) {
      query = Prisma.sql`
      SELECT *
      FROM (
        SELECT 
          'event' AS type, 
          e.id AS id, 
          e.title AS title, 
          es.name AS subcategory_name, 
          e.status_id AS status_id,
          e.publisher_id AS user_id,  
          u.full_name AS user_full_name, 
          e.has_banner as has_banner,
          array_agg(ls.id) AS live_streaming_ids,
          array_agg(NULL::text) AS images,
          array_agg(   
            json_build_object(

            'active', ep.active,
            'paused_at', ep.paused_at,
            'package', ep.promote_package_id
          )) AS event_package
        FROM events e
          LEFT JOIN users u ON e.publisher_id = u.id
          LEFT JOIN event_subcategories es ON e.subcategory_id = es.id
          LEFT JOIN event_packages ep ON e.id = ep.event_id
          LEFT JOIN live_streamings ls ON e.id = ls.event_id 
          GROUP BY e.id, e.title, es.name, e.status_id, u.full_name
      UNION ALL
        SELECT 
          'listing' AS type, 
          l.id AS id, 
          l.title AS title, 
          s.name AS subcategory_name, 
          l.status_id AS status_id,
          l.user_id AS user_id,
          u.full_name AS user_full_name,
          NULL AS has_banner,
          NULL AS live_streaming_ids,
          l.images AS images,
          array_agg(
            json_build_object(
              'active', lp.active, 
              'paused_at', lp.paused_at,
              'package', lp.promote_package_id
            ) ) AS listing_package
        FROM listings l
          LEFT JOIN users u ON l.user_id = u.id
          LEFT JOIN subcategories s ON l.subcategory_id = s.id
          LEFT JOIN listings_packages lp ON l.id = lp.listing_id
          GROUP BY l.id, l.title, s.name, l.status_id, u.full_name
      ) AS combined
          WHERE (title ILIKE '%' || ${search} || '%' OR user_full_name ILIKE '%' || ${search} || '%')
          AND status_id = ${LISTING_STATUS.ACTIVE}
          ORDER BY ${Prisma.raw(orderBy.join(', '))}
          OFFSET ${skip}
          LIMIT ${Number(take)};`;
    } else {
      query = Prisma.sql`
      SELECT *
      FROM (
        SELECT 
          'event' AS type, 
          e.id AS id, 
          e.title AS title, 
          es.name AS subcategory_name, 
          e.status_id AS status_id,
          e.publisher_id AS user_id,
          u.full_name AS user_full_name,
          e.has_banner as has_banner,
          array_agg(ls.id) AS live_streaming_ids,
          array_agg(NULL::text) AS images,
          array_agg(   
            json_build_object(
            'active', ep.active,
            'paused_at', ep.paused_at,
            'package', ep.promote_package_id
          )) AS event_package
        FROM events e
          LEFT JOIN users u ON e.publisher_id = u.id
          LEFT JOIN event_subcategories es ON e.subcategory_id = es.id
          LEFT JOIN event_packages ep ON e.id = ep.event_id
          LEFT JOIN live_streamings ls ON e.id = ls.event_id 
          GROUP BY e.id, e.title, es.name, e.status_id, u.full_name
      UNION ALL
        SELECT 
          'listing' AS type, 
          l.id AS id, 
          l.title AS title, 
          s.name AS subcategory_name, 
          l.status_id AS status_id,
          l.user_id AS user_id,
          u.full_name AS user_full_name,
          NULL AS has_banner,
          NULL AS live_streaming_ids,
          l.images AS images,
          array_agg(
            json_build_object(
              'active', lp.active, 
              'paused_at', lp.paused_at,
              'package', lp.promote_package_id
            ) ) AS listing_package
        FROM listings l
          LEFT JOIN users u ON l.user_id = u.id
          LEFT JOIN subcategories s ON l.subcategory_id = s.id
          LEFT JOIN listings_packages lp ON l.id = lp.listing_id
          GROUP BY l.id, l.title, s.name, l.status_id, u.full_name
      ) AS combined
      WHERE status_id = ${LISTING_STATUS.ACTIVE}
      ORDER BY ${Prisma.raw(orderBy.join(', '))}
      OFFSET ${skip}
      LIMIT ${Number(take)};`;
    }
  const queryResult: any[] = await prisma.$queryRaw(query);
  const total = queryResult.length;
  const pages = Math.ceil(total / take);
  const cursor = total > 0 ? queryResult[queryResult.length - 1].id : 0;
  
    return {
      list: queryResult.slice(0, take),
      total,
      cursor,
      pages,
    };

  }
}

