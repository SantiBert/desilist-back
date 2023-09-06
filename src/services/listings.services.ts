import {Listing, Prisma} from '@prisma/client';
import prisma from '@/db';
import {GetAllListing, GetAllListingCsv} from '@/interfaces/listing.interface';
import {LISTING_STATUS} from '@/constants/listingStatus';
import {diffToNowInDaysForCsv, getISONow} from '@/utils/time';
import {Parser} from 'json2csv';
import config from '@config';

export class ListingService {
  public listing = prisma.listing;

  public async find(params?): Promise<Partial<GetAllListing>> {
    const listingData = {
      listings: [],
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
      images: true,
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
          photo: true,
          photo_json: true
        }
      },
      created_at: true,
      paused_at: true,
      images_json: true // todo: remove this prop
    };

    // where
    const where = {deleted_at: null, paused_at: null};
    const subWhere = [];
    let take = 10;
    if (params) {
      params.paused_at && delete where['paused_at'];
      params.user_id ? (where['user_id'] = params.user_id) : null;
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

      params.highlighted ? (where['highlighted'] = true) : null;
      if (Number(params.status_id) !== -1) {
        where['status_id'] = params.status_id
          ? Number(params.status_id)
          : LISTING_STATUS.ACTIVE;
      }
      if (params.search) {
        subWhere.push({title: {contains: params.search, mode: 'insensitive'}});
        subWhere.push({
          user: {full_name: {contains: params.search, mode: 'insensitive'}}
        });
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

    listingData.listings = await this.listing.findMany(query);
    // total highlighted
    listingData.highlighted = await this.listing.count({
      where: {...where, highlighted: true}
    });
    // total results
    listingData.total = await this.listing.count({where: where});
    // total pages
    listingData.pages = Math.ceil(Number(listingData.total / take));
    // update lastCursor
    const lastResults = listingData.listings[listingData.listings.length - 1];
    if (lastResults) {
      listingData.cursor = lastResults.id;
    }

    return listingData;
  }

  public async findById(id: number): Promise<Partial<Listing> | null> {
    return await this.listing.findFirst({
      select: {
        id: true,
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
            active: true,
            created_at: true,
            activated_at: true,
            paused_at: true
          },
          orderBy: [{created_at: Prisma.SortOrder.asc}]
        },
        user: {
          select: {
            id: true,
            full_name: true,
            photo: true,
            photo_json: true,
            role_id: true
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
        bookmark: {
          select: {
            user_id: true,
            listing_id: true
          }
        },
        images: true,
        price: true,
        location: true,
        contact: true,
        website: true,
        custom_fields: true,
        created_at: true,
        paused_at: true,
        images_json: true // todo: remove this prop
      },
      where: {id, deleted_at: null}
    });
  }

  public async findByUser(
    userId: string,
    params?: any,
    showFlagged?: boolean
  ): Promise<Partial<GetAllListing>> {
    const listingData = {
      listings: [],
      highlighted: 0,
      total: 0,
      cursor: 0,
      pages: 0
    };

    //select
    const select = {
      id: true,
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
          activated_at: true,
          paused_at: true,
          active: true
        },
        orderBy: [{created_at: Prisma.SortOrder.asc}]
      },
      title: true,
      description: true,
      listing_status: {
        select: {
          id: true,
          name: true
        }
      },
      bookmark: {
        select: {
          user_id: true,
          listing_id: true
        }
      },
      images: true,
      price: true,
      location: true,
      contact: true,
      website: true,
      custom_fields: true,
      created_at: true,
      paused_at: true
    };
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

    //where
    const where = {
      deleted_at: null,
      user_id: userId,
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
      /*
      params.promoted
        ? (where['listing_packages'] = {
            none: {
              NOT: [{promote_package_id: {not: null}}]
            }
          })
        : (where['listing_packages'] = {
            none: {
              NOT: [{promote_package_id: null}]
            }
          });
      */
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
      params.highlighted ? (where['highlighted'] = true) : null;
      if (Number(params.status_id) !== -1) {
        where['status_id'] = params.status_id
          ? Number(params.status_id)
          : LISTING_STATUS.ACTIVE;
      }
      /*
      if (params.search) {
        subWhere.push({title: {contains: params.search, mode: 'insensitive'}});
        subWhere.push({
          user: {full_name: {contains: params.search, mode: 'insensitive'}}
        });
      }
      */
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

    listingData.listings = await this.listing.findMany(query);
    // total highlighted
    listingData.highlighted = await this.listing.count({
      where: {...where, highlighted: true}
    });
    //total results
    listingData.total = await this.listing.count({where: where});
    //total pages
    listingData.pages = Math.ceil(Number(listingData.total / take));
    //update lastCursor
    const lastResults = listingData.listings[listingData.listings.length - 1];
    if (lastResults) {
      listingData.cursor = lastResults.id;
    }

    return listingData;
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

  public async create(data: Listing): Promise<Partial<Listing> | null> {
    return await this.listing.create({
      select: {id: true, user_id: true},
      data
    });
  }

  public async findByUserForDelete(
    userId: string
  ): Promise<Partial<Listing>[] | null> {
    return await this.listing.findMany({
      select: {id: true},
      where: {user_id: userId}
    });
  }

  public async updateById(
    id: number,
    data: Partial<Listing>
  ): Promise<Partial<Listing> | null> {
    return await this.listing.update({
      select: {id: true},
      data: {...data, updated_at: getISONow()},
      where: {id}
    });
  }

  public async deleteById(id: number): Promise<void> {
    await this.listing.update({data: {deleted_at: getISONow()}, where: {id}});
  }

  public async deleteByUserId(userId: string): Promise<void> {
    await this.listing.updateMany({
      data: {deleted_at: getISONow()},
      where: {user_id: userId}
    });
  }

  public async activeByUserId(userId: string): Promise<void> {
    await this.listing.updateMany({
      data: {deleted_at: null},
      where: {user_id: userId}
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

    listingData.listings = await this.listing.findMany(query);
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
}
