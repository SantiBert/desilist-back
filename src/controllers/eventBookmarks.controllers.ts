import {NextFunction, Response} from 'express';
import {User} from '@prisma/client';
import {EventBookmarkService} from '@/services';
import {STATUS_CODES} from '@/constants';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {CreateEventBookmarkDto} from '@/dtos/eventBookmarks.dto';
import {GetAllBookmark} from '../interfaces/eventBookmark.interface';
import {
  bookmarkNotFoundException,
  bookmarkAlreadyExistsException,
  bookmarkUnathorizedException
} from '@/errors/bookmarks.error';
class EventBookmarksController {
  public event_bookmarks = new EventBookmarkService();

  public getEventBookmarks = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      const params = req.query;

      const bookmarksData: Partial<GetAllBookmark> =
        await this.event_bookmarks.findByUser(user.id, params);
      const {bookmarks, total, cursor, pages} = bookmarksData;

      res.status(STATUS_CODES.OK).json({
        data: {bookmarks, total, cursor, pages},
        message: 'OK'
      });
    } catch (error) {
      next(error);
    }
  };

  public createEventBookmark = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const bookmarkData: CreateEventBookmarkDto = req.body;
      const currentUser: User = req.user;
      const data = {
        ...bookmarkData,
        user_id: currentUser.id
      };
      const searchBookmark = await this.event_bookmarks.find(data as any);
      if (searchBookmark) {
        throw bookmarkAlreadyExistsException('already exists');
      }

      const createdBookmark = await this.event_bookmarks.create(data as any);
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

  public deleteEventBookmarks = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const eventId = Number(req.params.id);
      const currentUser: User = req.user;
      const data = {
        user_id: currentUser.id,
        event_id: eventId
      };
      const bookmarkToDelete: any = await this.event_bookmarks.find(data);
      if (!bookmarkToDelete) {
        throw bookmarkNotFoundException('Bookmark not found');
      }

      if (bookmarkToDelete.user_id !== currentUser.id) {
        throw bookmarkUnathorizedException('Insufficient Permissions');
      }
      res.status(STATUS_CODES.OK).json({message: bookmarkToDelete});

      await this.event_bookmarks.delete(currentUser.id, eventId);
      res.status(STATUS_CODES.OK).json({message: 'deleted'});
    } catch (error) {
      next(error);
    }
  };
}

export default EventBookmarksController;
