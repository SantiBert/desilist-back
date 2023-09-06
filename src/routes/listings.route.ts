import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import ListingsController from '@/controllers/listings.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import {
  GetAllListingsDto,
  GetListingsMeDto,
  CreateListingDto,
  UpdateListingDto,
  PublishListingDto,
  DeleteListingDto,
  ReportListingDto,
  PromoteListingDto
} from '@/dtos/listings.dto';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import aclMiddleware from '@/middlewares/acl.middleware';
import {UserRoles} from '@/constants';

class ListingsRoute implements Routes {
  public path = '/listings';
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
      this.listingsController.getListings
    );
    this.router.get(
      `${this.path}/me`,
      checkAPIVersion,
      validationMiddleware(GetListingsMeDto, 'params'),
      authMiddleware(),
      this.listingsController.getListingsMe
    );
    this.router.get(
      `${this.path}/:id`,
      checkAPIVersion,
      authMiddleware(true),
      this.listingsController.getListingById
    );
    this.router.post(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(CreateListingDto, 'body'),
      authMiddleware(),
      this.listingsController.createListing
    );
    this.router.patch(
      `${this.path}/:id`,
      checkAPIVersion,
      validationMiddleware(UpdateListingDto, 'body'),
      authMiddleware(),
      this.listingsController.updateListing
    );
    this.router.delete(
      `${this.path}/:id`,
      checkAPIVersion,
      validationMiddleware(DeleteListingDto, 'body'),
      authMiddleware(),
      this.listingsController.deleteListing
    );
    this.router.patch(
      `${this.path}/:id/publish`,
      checkAPIVersion,
      validationMiddleware(PublishListingDto, 'body'),
      authMiddleware(),
      this.listingsController.publishListing
    );
    this.router.patch(
      `${this.path}/:id/promote`,
      checkAPIVersion,
      authMiddleware(),
      validationMiddleware(PromoteListingDto, 'body'),
      this.listingsController.promoteListing
    );
    this.router.patch(
      `${this.path}/:id/report`,
      checkAPIVersion,
      validationMiddleware(ReportListingDto, 'body'),
      authMiddleware(),
      this.listingsController.reportListing
    );
    this.router.get(
      `${this.path}/:id/report`,
      checkAPIVersion,
      authMiddleware(true),
      this.listingsController.isReportedListing
    );
    this.router.get(
      `${this.path}/download/csv`,
      checkAPIVersion,
      validationMiddleware(GetAllListingsDto, 'params'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingsController.downloadCsvListing
    );
    this.router.get(
      `${this.path}/:id/share`,
      checkAPIVersion,
      authMiddleware(true),
      this.listingsController.shareListingById
    );
  }
}

export default ListingsRoute;
