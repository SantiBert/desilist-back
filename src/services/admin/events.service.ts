import {Listing, Event, Prisma} from '@prisma/client';
import prisma from '@/db';
import {LISTING_STATUS} from '@/constants/listingStatus';
import {getISONow} from '@/utils/time';
import {GetAllEvent} from '@/interfaces/events.interface';

export class AdminEventsService {
  public listing = prisma.listing;
  public event = prisma.event;

  public async find(params?): Promise<Partial<GetAllEvent>> {
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
          category: {select: {id: true, name: true, type: true}}
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
      eventPackage: {
        select: {
          id: true,
          promote_package_id: true,
          promote_package: {
            select: {id: true, name: true, duration: true}
          },
          created_at: true,
          activated_at: true,
          paused_at: true,
          active: true
        }
      },
      terms_event: true,
      created_at: true,
      paused_at: true
    };

    //where
    const where = {deleted_at: null};
    const subWhere = [];
    let take = 10;
    if (params) {
      params.user_id ? (where['publisher_id'] = params.user_id) : null;
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
        }
      }
      params.highlighted ? (where['highlighted'] = true) : null;
      params.paused_at ? where['paused_at'] !== null : null;
      /*
      if (Number(params.status_id) !== -1) {
        where['status_id'] = params.status_id
          ? Number(params.status_id)
          : LISTING_STATUS.ACTIVE;
      }
      */
      if (params.status_id && Number(params.status_id) !== -1) {
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
    if (params?.take) {
      take = Number(params.take);
    }

    //query
    const query = {
      select: select
    };

    //cursor
    if (params?.cursor && !params.skip) {
      query['cursor'] = {
        id: Number(params.cursor)
      };
      query['skip'] = 1;
    }

    //skip
    if (params?.skip && !params.cursor) {
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
    if (params?.order) {
      order = params.order;
    }
    if (params?.order_by) {
      criteria = params.order_by;
    }
    query['orderBy'] = {
      [criteria]: order ? order : 'desc'
    };

    eventData.events = await this.event.findMany(query);
    // total highlighted
    eventData.highlighted = await this.event.count({
      where: {...where, highlighted: true}
    });
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
            email: true,
            full_name: true,
            photo: true,
            photo_json: true
          }
        },
        publisher_id: true,
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
            created_at: true,
            activated_at: true,
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
        terms_event: {
          select: {
            event_term: true
          }
        },
        created_at: true,
        paused_at: true
      },
      where: {id}
    });
  }

  public async findBySubcategoryId(id: number): Promise<Partial<Event>[]> {
    return await this.event.findMany({
      select: {id: true},
      where: {
        status_id: LISTING_STATUS.ACTIVE,
        subcategory_id: id,
        deleted_at: null,
        paused_at: null
      }
    });
  }

  public async create(data: Event): Promise<Partial<Event> | null> {
    return await this.event.create({
      select: {id: true},
      data
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

  public async pauseById(id: number): Promise<Partial<Listing> | null> {
    return await this.listing.update({
      select: {id: true},
      data: {
        highlighted: false,
        paused_at: getISONow(),
        updated_at: getISONow()
      },
      where: {id}
    });
  }

  public async unpauseById(id: number): Promise<Partial<Listing> | null> {
    return await this.listing.update({
      select: {id: true},
      data: {paused_at: null, updated_at: getISONow()},
      where: {id}
    });
  }

  public async highlightById(id: number): Promise<Partial<Listing> | null> {
    return await this.event.update({
      select: {id: true},
      data: {highlighted: true, updated_at: getISONow()},
      where: {id}
    });
  }

  public async cancelhighlightById(
    id: number
  ): Promise<Partial<Listing> | null> {
    return await this.event.update({
      select: {id: true},
      data: {highlighted: false, updated_at: getISONow()},
      where: {id}
    });
  }

  public async approveEvent(id: number): Promise<Partial<Event> | null> {
    return await this.event.update({
      select: {id: true},
      data: {
        paused_at: null,
        status_id: LISTING_STATUS.ACTIVE,
        updated_at: getISONow()
      },
      where: {id}
    });
  }

  public async reproveEvent(id: number): Promise<Partial<Event> | null> {
    return await this.event.update({
      select: {id: true},
      data: {
        paused_at: null,
        status_id: LISTING_STATUS.PENDING,
        updated_at: getISONow()
      },
      where: {id}
    });
  }

  public async denyEvent(id: number): Promise<Partial<Event> | null> {
    return await this.event.update({
      select: {id: true},
      data: {
        paused_at: null,
        status_id: LISTING_STATUS.DENIED,
        updated_at: getISONow(),
      },
      where: {id}
    });
  }

  public async flagById(id: number): Promise<Partial<Event> | null> {
    return await this.event.update({
      select: {id: true},
      data: {
        paused_at: getISONow(),
        status_id: LISTING_STATUS.FLAGGED,
        updated_at: getISONow()
      },
      where: {id}
    });
  }

  public async unflagById(id: number): Promise<Partial<Event> | null> {
    return await this.event.update({
      select: {id: true},
      data: {
        paused_at: null,
        status_id: LISTING_STATUS.ACTIVE,
        updated_at: getISONow()
      },
      where: {id}
    });
  }

  public async publishById(id: number): Promise<Partial<Listing> | null> {
    return await this.listing.update({
      select: {id: true},
      data: {status_id: LISTING_STATUS.ACTIVE, updated_at: getISONow()},
      where: {id}
    });
  }

  public async deleteById(id: number): Promise<void> {
    await this.listing.delete({
      where: {id}
    });
  }
}
