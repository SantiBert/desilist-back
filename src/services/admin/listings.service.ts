import {Listing, Prisma} from '@prisma/client';
import prisma from '@/db';
import {GetAllListing} from '@/interfaces/listing.interface';
import {LISTING_STATUS} from '@/constants/listingStatus';
import {getISONow} from '@/utils/time';

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
    //select
    const select = {
      id: true,
      title: true,
      images: true,
      subcategory: {
        select: {
          id: true,
          name: true,
          category: {select: {id: true, name: true, type: true}}
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
        }
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
      paused_at: true
    };

    //where
    const where = {deleted_at: null};
    const subWhere = [];
    let take = 10;
    if (params) {
      params.user_id ? (where['user_id'] = params.user_id) : null;
      params.category_id
        ? (where['subcategory'] = {category_id: Number(params.category_id)})
        : null;
      params.subcategory_id
        ? (where['subcategory_id'] = Number(params.subcategory_id))
        : null;
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
            some: {
              promote_package_id: null,
              active: true,
              paused_at: null
            }
          };
        }
      }
      params.highlighted ? (where['highlighted'] = true) : null;
      params.paused_at ? where['paused_at'] !== null : null;
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
            created_at: true,
            activated_at: true,
            paused_at: true,
            active: true
          }
        },
        listing_flag_report: true,
        listings_flagged: {
          select: {
            reasons_id: true,
            comment: true,
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
        },
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            photo_json: true
          }
        },
        user_id: true,
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
        location: true,
        contact: true,
        website: true,
        custom_fields: true,
        created_at: true,
        paused_at: true
      },
      where: {id}
    });
  }

  public async findBySubcategoryId(id: number): Promise<Partial<Listing>[]> {
    return await this.listing.findMany({
      select: {id: true},
      where: {
        status_id: LISTING_STATUS.ACTIVE,
        subcategory_id: id,
        deleted_at: null,
        paused_at: null
      }
    });
  }

  public async create(data: Listing): Promise<Partial<Listing> | null> {
    return await this.listing.create({
      select: {id: true},
      data
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
    return await this.listing.update({
      select: {id: true},
      data: {highlighted: true, updated_at: getISONow()},
      where: {id}
    });
  }

  public async cancelhighlightById(
    id: number
  ): Promise<Partial<Listing> | null> {
    return await this.listing.update({
      select: {id: true},
      data: {highlighted: false, updated_at: getISONow()},
      where: {id}
    });
  }

  public async flagById(id: number): Promise<Partial<Listing> | null> {
    return await this.listing.update({
      select: {id: true},
      data: {
        paused_at: getISONow(),
        status_id: LISTING_STATUS.FLAGGED,
        updated_at: getISONow()
      },
      where: {id}
    });
  }

  public async unflagById(id: number): Promise<Partial<Listing> | null> {
    return await this.listing.update({
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
