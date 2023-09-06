import {NextFunction, Request, Response} from 'express';
import {STATUS_CODES} from '@/constants';
import {NotificationService} from '@/services/notification.service';
import {RequestWithUser} from '@/interfaces/auth.interface';

class NotificationsController {
  public notifications = new NotificationService();

  public update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      res
        .status(STATUS_CODES.OK)
        .json({/* data: findCategory, */ message: 'updated'});
    } catch (error) {
      next(error);
    }
  };

  public updateMany = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      res
        .status(STATUS_CODES.OK)
        .json({/* data: findCategory, */ message: 'updated'});
    } catch (error) {
      next(error);
    }
  };

  public setToRead = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await this.notifications.setToRead(id);

      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };

  public setToReadMany = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      await this.notifications.setToReadByUserId(user.id);

      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };
}

export default NotificationsController;
