import {Router} from 'express';
import NotificationsController from '@controllers/notifications.controller';

import {Routes} from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import {SetReadManyNotificationDto} from '@/dtos/notification.dto';

class NotificationsRoute implements Routes {
  public path = '/notifications';
  public router = Router();
  public notificationsController = new NotificationsController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.patch(
      `${this.path}/:id/set_to_read`,
      checkAPIVersion,
      // validationMiddleware(SetReadNotificationDto, 'params'),
      authMiddleware(),
      this.notificationsController.setToRead
    );
    this.router.patch(
      `${this.path}/set_to_read`,
      checkAPIVersion,
      validationMiddleware(SetReadManyNotificationDto, 'body'),
      authMiddleware(),
      this.notificationsController.setToReadMany
    );
  }
}

export default NotificationsRoute;
