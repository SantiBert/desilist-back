import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import aclMiddleware from '@/middlewares/acl.middleware';
import {UserRoles} from '../../constants/user.constants';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import AdminEventApprovalController from '@/controllers/admin/eventApproval.controller';

class AdminEventPendingRoute implements Routes {
  public path = '/admin/event/pending';
  public router = Router();
  public eventAppovalController = new AdminEventApprovalController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventAppovalController.getAllPendingEvents
    );

    this.router.get(
      `${this.path}/reasons`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventAppovalController.getDeniedReasons
    );

    this.router.get(
      `${this.path}/:id`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventAppovalController.getReportByListingId
    );

    this.router.patch(
      `${this.path}/:id/seen`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventAppovalController.seenNewChanges
    );
  }
}

export default AdminEventPendingRoute;
