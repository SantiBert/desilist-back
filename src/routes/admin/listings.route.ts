import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import ListingsController from '@/controllers/admin/listings.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import {
  GetAllListingsDto,
  CreateListingDto,
  UpdateListingDto,
  PauseListingDto,
  UnpauseListingDto,
  HighlightListingDto,
  CancelHighlightListingDto,
  PromoteListingDto,
  FlagListingDto,
  UnflagListingDto
} from '@/dtos/listings.dto';
import aclMiddleware from '@/middlewares/acl.middleware';
import {UserRoles} from '@/constants/user.constants';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';

class AdminListingsRoute implements Routes {
  public path = '/admin/listings';
  public router = Router();
  public listingsController = new ListingsController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(GetAllListingsDto, 'params'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingsController.getListings
    );
    this.router.get(
      `${this.path}/:id`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingsController.getListingById
    );
    this.router.post(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(CreateListingDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingsController.createListing
    );
    this.router.patch(
      `${this.path}/:id`,
      checkAPIVersion,
      validationMiddleware(UpdateListingDto, 'body', true),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingsController.updateListing
    );
    this.router.delete(
      `${this.path}/:id`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingsController.deleteListing
    );
    this.router.patch(
      `${this.path}/:id/pause`,
      checkAPIVersion,
      validationMiddleware(PauseListingDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingsController.pauseListing
    );
    this.router.patch(
      `${this.path}/:id/unpause`,
      checkAPIVersion,
      validationMiddleware(UnpauseListingDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingsController.unpauseListing
    );
    this.router.patch(
      `${this.path}/:id/highlight`,
      checkAPIVersion,
      validationMiddleware(HighlightListingDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingsController.highlightListing
    );
    this.router.patch(
      `${this.path}/:id/cancel_highlight`,
      checkAPIVersion,
      validationMiddleware(CancelHighlightListingDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingsController.cancelHighlightListing
    );
    this.router.patch(
      `${this.path}/:id/promote`,
      checkAPIVersion,
      validationMiddleware(PromoteListingDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingsController.promoteListing
    );
    this.router.patch(
      `${this.path}/:id/flag`,
      checkAPIVersion,
      validationMiddleware(FlagListingDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingsController.flagListing
    );
    this.router.patch(
      `${this.path}/:id/unflag`,
      checkAPIVersion,
      validationMiddleware(UnflagListingDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingsController.unflagListing
    );
  }
}

export default AdminListingsRoute;
