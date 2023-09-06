import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import aclMiddleware from '@/middlewares/acl.middleware';
import {UserRoles} from '../constants/user.constants';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import EventApprovalController from '@/controllers/eventApproval.controller';

class EventPendingRoute implements Routes {
  public path = '/event/pending';
  public router = Router();
  public eventAppovalController = new EventApprovalController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}/reasons`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.USER),
      this.eventAppovalController.getDeniedReasons
    );

    this.router.get(
      `${this.path}/:id`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.USER),
      this.eventAppovalController.getReportByEventId
    );
  }
}

export default EventPendingRoute;
