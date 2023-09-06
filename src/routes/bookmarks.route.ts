import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import BookmarksController from '@/controllers/bookmarks.controllers';
import validationMiddleware from '@/middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import {CreateBookmarkDto} from '@/dtos/bookmarks.dto';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';

class BookmarksRoute implements Routes {
  public path = '/bookmarks';
  public router = Router();
  public bookmarksController = new BookmarksController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      checkAPIVersion,
      authMiddleware(),
      this.bookmarksController.getBookmarks
    );
    this.router.post(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(CreateBookmarkDto, 'body'),
      authMiddleware(),
      this.bookmarksController.createBookmark
    );
    this.router.delete(
      `${this.path}/:id`,
      checkAPIVersion,
      authMiddleware(),
      this.bookmarksController.deleteBookmarks
    );
  }
}

export default BookmarksRoute;
