import {Bookmark} from '@prisma/client';
import prisma from '@/db';
import {GetAllBookmark} from '../interfaces/bookmark.interface';
import {LISTING_STATUS} from '@/constants/listingStatus';

export class BookmarkService {
  public bookmark = prisma.bookmark;

  public async find(params?): Promise<Partial<Bookmark>> {
    if (params) {
      params.user_id ? (params.user_id = params.user_id) : '';
      params.listing_id ? (params.listing_id = params.listing_id) : null;
    }
    return await this.bookmark.findFirst({
      select: {
        user_id: true,
        listing_id: true
      },
      where: {
        user_id: params.user_id,
        listing_id: params.listing_id
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
      listing: {
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
          location: true,
          contact: true,
          website: true,
          custom_fields: true,
          created_at: true,
          status_id: true,
          paused_at: true
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
      listing: {
        status_id: LISTING_STATUS.ACTIVE,
        paused_at: null
      }
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
    bookmarkData.bookmarks = await this.bookmark.findMany(query);
    //total results
    bookmarkData.total = await this.bookmark.count({where: where});
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

  public async create(data: Bookmark): Promise<Partial<Bookmark> | null> {
    return await this.bookmark.create({
      data
    });
  }

  public async delete(user_id: string, listing_id: number): Promise<void> {
    await this.bookmark.delete({
      where: {
        user_id_listing_id: {
          user_id: user_id,
          listing_id: listing_id
        }
      }
    });
  }

  public async deleteByUser(user_id: string): Promise<void> {
    await this.bookmark.deleteMany({
      where: {
        user_id: user_id
      }
    });
  }

  public async deleteByListing(listing_id: number): Promise<void> {
    await this.bookmark.deleteMany({
      where: {
        listing_id: listing_id
      }
    });
  }
}
