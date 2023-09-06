import {EventBookmark} from '@prisma/client';
import prisma from '@/db';
import {GetAllBookmark} from '../interfaces/eventBookmark.interface';
import {LISTING_STATUS} from '@/constants/listingStatus';

export class EventBookmarkService {
  public event_bookmarks = prisma.eventBookmark;

  public async find(params?): Promise<Partial<EventBookmark>> {
    if (params) {
      params.user_id ? (params.user_id = params.user_id) : '';
      params.event_id ? (params.event_id = params.event_id) : null;
    }
    return await this.event_bookmarks.findFirst({
      select: {
        user_id: true,
        event_id: true
      },
      where: {
        user_id: params.user_id,
        event_id: params.event_id
      }
    });
  }

  
  public async findByUser(
    user_id: string,
    params?: any
  ): Promise<Partial<GetAllBookmark>> {
    const bookmarkData = {
      bookmarks: [],
      total: 0,
      cursor: 0,
      pages: 0
    };

    //select
    const select = {
      event: {
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
          status: {
            select: {
              id: true,
              name: true
            }
          },
          highlighted: true,
          publisher: {
            select: {
              id: true,
              full_name: true,
              photo: true,
              photo_json: true
            }
          },
          created_at: true,
          paused_at: true,
        }
      },
      user: {
        select: {
          id: true,
          full_name: true
        }
      }
    };

    //where
    const where = {
      user_id: user_id,
      event: {status_id: LISTING_STATUS.ACTIVE}
    };
    

    let take = 10;
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
    bookmarkData.bookmarks = await this.event_bookmarks.findMany(query);
    //total results
    bookmarkData.total = await this.event_bookmarks.count({where: where});
    //total pages
    bookmarkData.pages = Math.ceil(Number(bookmarkData.total / take));
    //update lastCursor
    const lastResults =
      bookmarkData.bookmarks[bookmarkData.bookmarks.length - 1];
    if (lastResults) {
      bookmarkData.cursor = lastResults.id;
    }
    return bookmarkData;
  }

  public async create(data: EventBookmark): Promise<Partial<EventBookmark> | null> {
    return await this.event_bookmarks.create({
      data
    });
  }

  public async delete(user_id: string, event_id: number): Promise<void> {
    await this.event_bookmarks.delete({
      where: {
        user_id_event_id: {
          user_id: user_id,
          event_id: event_id
        }
      }
    });
  }

  public async deleteByUser(user_id: string): Promise<void> {
    await this.event_bookmarks.deleteMany({
      where: {
        user_id: user_id
      }
    });
  }

  public async deleteByListing(event_id: number): Promise<void> {
    await this.event_bookmarks.deleteMany({
      where: {
        event_id: event_id
      }
    });
  }
}
