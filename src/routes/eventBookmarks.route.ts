import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import EventBookmarksController from '@/controllers/eventBookmarks.controllers';
import validationMiddleware from '@/middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import { CreateEventBookmarkDto } from '@/dtos/eventBookmarks.dto';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';

class EventBookmarksRoute implements Routes {
  public path = '/event/bookmarks';
  public router = Router();
  public eventBookmarksController = new EventBookmarksController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      checkAPIVersion,
      authMiddleware(),
      this.eventBookmarksController.getEventBookmarks
    );
    this.router.post(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(CreateEventBookmarkDto, 'body'),
      authMiddleware(),
      this.eventBookmarksController.createEventBookmark
    );
    this.router.delete(
      `${this.path}/:id`,
      checkAPIVersion,
      authMiddleware(),
      this.eventBookmarksController.deleteEventBookmarks
    );
  }
}

export default EventBookmarksRoute;
