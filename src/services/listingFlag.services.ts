import prisma from '@/db';
// import {UserRoles, UserStatus} from '@/constants';
// import {LISTING_STATUS} from '@/constants/listingStatus';
// import {GetAllListingReported} from '@/interfaces/listingFlage.interface';
// import {Prisma} from '@prisma/client';
// import {getISONow} from '@/utils/time';

export class ListingFlagService {
  public listingsReports = prisma.listingFlagReport;
  public listingsFlagged = prisma.listingFlagged;
  public listing = prisma.listing;

  //   public async getAllListingReported(
  //     params?
  //   ): Promise<Partial<GetAllListingReported>> {
  //     const listingData = {
  //       listings: [],
  //       highlighted: 0,
  //       total: 0,
  //       cursor: 0,
  //       pages: 0
  //     };
  //     //select
  //     const select = {
  //       id: true,
  //       title: true,
  //       images: true,
  //       status_id: true,
  //       subcategory: {
  //         select: {
  //           id: true,
  //           name: true,
  //           category: {select: {id: true, name: true}}
  //         }
  //       },
  //       highlighted: true,
  //       listing_packages: {
  //         select: {
  //           id: true,
  //           basic_package: {
  //             select: {id: true, name: true, duration: true}
  //           },
  //           promote_package: {
  //             select: {id: true, name: true, duration: true}
  //           },
  //           created_at: true,
  //           activated_at: true,
  //           paused_at: true,
  //           active: true
  //         }
  //       },
  //       listing_flag_report: true,
  //       user: {
  //         select: {
  //           id: true,
  //           full_name: true,
  //           photo: true
  //         }
  //       },
  //       listings_flagged: {
  //         select: {
  //           new_changes: true
  //         },
  //         where: {
  //           dismissed: false,
  //           deleted_at: null
  //         },
  //         take: 1,
  //         orderBy: [
  //           {
  //             new_changes: Prisma.SortOrder.desc
  //           }
  //         ]
  //       },
  //       created_at: true,
  //       paused_at: true
  //     };

  //     //where
  //     const where = {
  //       deleted_at: null,
  //       listing_flag_report: {
  //         some: {
  //           dismissed: false
  //         }
  //       }
  //     };
  //     const subWhere = [];
  //     let take = 10;
  //     if (params) {
  //       params.user_id ? (where['user_id'] = params.user_id) : null;
  //       params.category_id
  //         ? (where['subcategory'] = {category_id: Number(params.category_id)})
  //         : null;
  //       params.subcategory_id
  //         ? (where['subcategory_id'] = Number(params.subcategory_id))
  //         : null;
  //       if (params.promoted) {
  //         if (params.promoted === 'true') {
  //           where['listing_packages'] = {
  //             some: {
  //               promote_package_id: {not: null},
  //               active: true,
  //               paused_at: null
  //             }
  //           };
  //         } else {
  //           where['listing_packages'] = {
  //             some: {
  //               promote_package_id: null,
  //               active: true,
  //               paused_at: null
  //             }
  //           };
  //         }
  //       }
  //       params.highlighted ? (where['highlighted'] = true) : null;
  //       params.paused_at ? where['paused_at'] !== null : null;
  //       if (Number(params.status_id) !== -1) {
  //         where['status_id'] = params.status_id
  //           ? Number(params.status_id)
  //           : LISTING_STATUS.ACTIVE;
  //       }
  //       if (params.search) {
  //         subWhere.push({title: {contains: params.search, mode: 'insensitive'}});
  //         subWhere.push({
  //           user: {full_name: {contains: params.search, mode: 'insensitive'}}
  //         });
  //       }
  //       subWhere.length > 0 ? (where['OR'] = subWhere) : null;
  //     }

  //     //take
  //     if (params.take) {
  //       take = Number(params.take);
  //     }

  //     //query
  //     const query = {
  //       select: select
  //     };

  //     //cursor
  //     if (params.cursor && !params.skip) {
  //       query['cursor'] = {
  //         id: Number(params.cursor)
  //       };
  //       query['skip'] = 1;
  //     }

  //     //skip
  //     if (params.skip && !params.cursor) {
  //       query['skip'] = Number(params.skip);
  //     }

  //     if (where) {
  //       query['where'] = where;
  //     }

  //     if (take > 0) {
  //       query['take'] = take;
  //     }

  //     let order,
  //       criteria = 'id';
  //     if (params.order) {
  //       order = params.order;
  //     }
  //     if (params.order_by) {
  //       criteria = params.order_by;
  //     }
  //     query['orderBy'] = [
  //       {
  //         [criteria]: order ? order : 'desc'
  //       }
  //     ];

  //     listingData.listings = await this.listing.findMany(query);
  //     //total results
  //     listingData.total = await this.listing.count({where: where});
  //     //total pages
  //     listingData.pages = Math.ceil(Number(listingData.total / take));
  //     //update lastCursor
  //     const lastResults = listingData.listings[listingData.listings.length - 1];
  //     if (lastResults) {
  //       listingData.cursor = lastResults.id;
  //     }

  //     return listingData;
  //   }

  public async getFlagByListingId(id: number): Promise<Partial<any>> {
    return await this.listingsFlagged.findFirst({
      select: {
        id: true,
        listing_id: true,
        comment: true,
        new_changes: true,
        reasons_id: true
      },
      where: {
        listing_id: id,
        dismissed: false,
        deleted_at: null
      }
    });
  }

  //   public async updateReportsByListingId(
  //     id: number,
  //     data: Partial<any>
  //   ): Promise<Partial<any> | null> {
  //     return await this.listingsReports.updateMany({
  //       data: {
  //         ...data
  //       },
  //       where: {
  //         listing_id: id,
  //         dismissed: false
  //       }
  //     });
  //   }

  //   public async createFlagged(data: any): Promise<Partial<any>> {
  //     return await this.listingsFlagged.create({
  //       select: {
  //         id: true
  //       },
  //       data
  //     });
  //   }

  //   public async updateFlagged(
  //     id: number,
  //     data: Partial<any>
  //   ): Promise<Partial<any> | null> {
  //     return await this.listingsFlagged.updateMany({
  //       data: {
  //         ...data,
  //         updated_at: getISONow()
  //       },
  //       where: {
  //         listing_id: id
  //       }
  //     });
  //   }

  //   public async updateNewChanges(
  //     id: number,
  //     newChanges: boolean
  //   ): Promise<Partial<any>> {
  //     return await this.listingsFlagged.updateMany({
  //       where: {
  //         listing_id: id,
  //         dismissed: false,
  //         deleted_at: null
  //       },
  //       data: {
  //         new_changes: newChanges
  //       }
  //     });
  //   }
}
