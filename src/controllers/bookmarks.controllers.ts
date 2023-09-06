import {NextFunction, Response} from 'express';
import {User} from '@prisma/client';
import {BookmarkService} from '@/services';
import {STATUS_CODES} from '@/constants';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {CreateBookmarkDto} from '@/dtos/bookmarks.dto';
import {GetAllBookmark} from '../interfaces/bookmark.interface';
import {
  bookmarkNotFoundException,
  bookmarkAlreadyExistsException,
  bookmarkUnathorizedException
} from '@/errors/bookmarks.error';
class BookmarksController {
  public bookmarks = new BookmarkService();

  public getBookmarks = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      const params = req.query;

      const bookmarksData: Partial<GetAllBookmark> =
        await this.bookmarks.findByUser(user.id, params);
      const {bookmarks, total, cursor, pages} = bookmarksData;

      res.status(STATUS_CODES.OK).json({
        data: {bookmarks, total, cursor, pages},
        message: 'OK'
      });
    } catch (error) {
      next(error);
    }
  };

  public createBookmark = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const bookmarkData: CreateBookmarkDto = req.body;
      const currentUser: User = req.user;
      const data = {
        ...bookmarkData,
        user_id: currentUser.id
      };
      const searchBookmark = await this.bookmarks.find(data as any);
      if (searchBookmark) {
        throw bookmarkAlreadyExistsException('already exists');
      }

      const createdBookmark = await this.bookmarks.create(data as any);
      if (!createdBookmark) {
        throw new Error('Server Error');
      }

      res
        .status(STATUS_CODES.CREATED)
        .json({data: {bookmark: createdBookmark}, message: 'created'});
    } catch (error) {
      next(error);
    }
  };

  public deleteBookmarks = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const listingId = Number(req.params.id);
      const currentUser: User = req.user;
      const data = {
        user_id: currentUser.id,
        listing_id: listingId
      };
      const bookmarkToDelete: any = await this.bookmarks.find(data);
      if (!bookmarkToDelete) {
        throw bookmarkNotFoundException('Bookmark not found');
      }

      if (bookmarkToDelete.user_id !== currentUser.id) {
        throw bookmarkUnathorizedException('Insufficient Permissions');
      }
      res.status(STATUS_CODES.OK).json({message: bookmarkToDelete});

      await this.bookmarks.delete(currentUser.id, listingId);
      res.status(STATUS_CODES.OK).json({message: 'deleted'});
    } catch (error) {
      next(error);
    }
  };
}

export default BookmarksController;
