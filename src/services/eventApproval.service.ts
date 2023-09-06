import prisma from '@/db';
import {UserRoles, UserStatus} from '@/constants';
import {LISTING_STATUS} from '@/constants/listingStatus';
import {Prisma} from '@prisma/client';
import {getISONow} from '@/utils/time';
import { GetAllEventsReported } from '@/interfaces/eventApproval.interface';

export class EventApprovalService {
  public eventApproval = prisma.eventPending;
  public event = prisma.event;
  public reasons = prisma.deniedReasons;

  public async getAllEventPending(
    params?
  ): Promise<Partial<GetAllEventsReported>> {
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
      status_id: true,
      subcategory: {
        select: {
          id: true,
          name: true,
          category: {select: {id: true, name: true}}
        }
      },
      highlighted: true,
      eventPackage: {
        select: {
          id: true,
          promote_package: {
            select: {id: true, name: true, duration: true}
          },
          created_at: true,
          activated_at: true,
          paused_at: true,
          active: true
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
      eventPending: {
        select: {
          approved: true,
          explanation: true,
          reason: true,
          new_changes: true,
          updated_at: true
        }
      },
      created_at: true,
      paused_at: true
    };

    //where
    const where = {
      deleted_at: null,
      eventPending: {
          some: {
            deleted_at: null
          }
        }     
    };

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
          : LISTING_STATUS.PENDING;
      }
      if (params.search) {
        subWhere.push({title: {contains: params.search, mode: 'insensitive'}});
        subWhere.push({
          user: {full_name: {contains: params.search, mode: 'insensitive'}}
        });
      }
      subWhere.length > 0 ? where['AND'].push({OR: subWhere}) : null;
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
    query['orderBy'] = [
      {
        [criteria]: order ? order : 'desc'
      }
    ];

    eventData.events = await this.event.findMany(query);
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
  }

  public async getReportByEventId(id: number): Promise<Partial<any>> {
    return await this.eventApproval.findMany({
      select: {
        id: true,
        explanation: true,
        reason: {
          select: {
            id: true,
            name: true
          }
        },
        new_changes: true,
      },
      where: {
        deleted_at: null,
        event_id: id,
      }
    });
  }

  public async updateReportsByEventId(
    id: number,
    data: Partial<any>
  ): Promise<Partial<any> | null> {
    return await this.eventApproval.updateMany({
      data: {
        ...data
      },
      where: {
        event_id: id,
      }
    });
  }

  public async getDeniedReasons(): Promise<Partial<any> | null> {
    return await this.reasons.findMany();
  }

  public async createPending(data: any): Promise<Partial<any>> {
    return await this.eventApproval.create({
      select: {
        id: true
      },
      data
    });
  }
  /*
  public async updateFlagged(
    id: number,
    data: Partial<any>
  ): Promise<Partial<any> | null> {
    return await this.eventApproval.updateMany({
      data: {
        ...data,
        updated_at: getISONow()
      },
      where: {
        event_id: id
      }
    });
  }
  */

  public async updateNewChanges(
    id: number,
    newChanges: boolean
  ): Promise<Partial<any>> {
    return await this.eventApproval.updateMany({
      where: {
        event_id: id,
        deleted_at: null
      },
      data: {
        new_changes: newChanges
      }
    });
  }
}
