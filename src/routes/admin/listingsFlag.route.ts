import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import aclMiddleware from '@/middlewares/acl.middleware';
import {UserRoles} from '../../constants/user.constants';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import ListingFlagController from '@/controllers/admin/listingFlag.controller';

class AdminListingFlagRoute implements Routes {
  public path = '/admin/flagged';
  public router = Router();
  public listingFlagController = new ListingFlagController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingFlagController.getFlaggedListings
    );

    this.router.get(
      `${this.path}/:id`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingFlagController.getReportByListingId
    );

    this.router.patch(
      `${this.path}/:id/seen`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingFlagController.seenNewChanges
    );
  }
}

export default AdminListingFlagRoute;
