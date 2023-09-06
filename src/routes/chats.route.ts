import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import ChatsController from '@/controllers/chats.controller';
import authMiddleware from '@middlewares/auth.middleware';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';

class ChatsRoute implements Routes {
  public path = '/chats';
  public router = Router();
  public chatsController = new ChatsController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}/exist`,
      checkAPIVersion,
      authMiddleware(true),
      this.chatsController.existChat
    );
    this.router.get(
      `${this.path}/:id`,
      checkAPIVersion,
      authMiddleware(),
      this.chatsController.getChatById
    );
    this.router.post(
      `${this.path}`,
      checkAPIVersion,
      authMiddleware(true),
      this.chatsController.createChat
    );
    this.router.post(
      `${this.path}/message`,
      checkAPIVersion,
      authMiddleware(true),
      this.chatsController.createMessage
    );
    this.router.patch(
      `${this.path}/:id/seen`,
      checkAPIVersion,
      authMiddleware(),
      this.chatsController.seenMessage
    );
    this.router.patch(
      `${this.path}/:id/blocked`,
      checkAPIVersion,
      authMiddleware(),
      this.chatsController.lockedChat
    );
    this.router.get(
      `${this.path}`,
      checkAPIVersion,
      authMiddleware(),
      this.chatsController.getChatByUser
    );
    this.router.get(
      `${this.path}/room/exist`,
      checkAPIVersion,
      authMiddleware(true),
      this.chatsController.getChatByRoom
    );
    this.router.patch(
      `${this.path}/:id/archived`,
      checkAPIVersion,
      authMiddleware(true),
      this.chatsController.archivedChat
    );
  }
}

export default ChatsRoute;
