import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import aclMiddleware from '@/middlewares/acl.middleware';
import {UserRoles} from '../constants/user.constants';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import ListingFlagController from '@/controllers/listingFlag.controller';
import {UpdateListingDto} from '@/dtos/listings.dto';
import validationMiddleware from '@/middlewares/validation.middleware';
import ListingsController from '@/controllers/listings.controller';

class ListingFlagRoute implements Routes {
  public path = '/listings/flagged';
  public router = Router();
  public listingFlagController = new ListingFlagController();
  public listingsController = new ListingsController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}/:id`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.USER),
      this.listingFlagController.getFlagByListingId
    );
    this.router.patch(
      `${this.path}/:id/confirm`,
      checkAPIVersion,
      validationMiddleware(UpdateListingDto, 'body'),
      authMiddleware(),
      this.listingsController.updateFlaggedListing
    );
  }
}

export default ListingFlagRoute;
