import {Router} from 'express';
import ListingPackageController from '@/controllers/admin/listingPackages.controller';
import {Routes} from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import {UserRoles} from '@/constants/user.constants';
import authMiddleware from '@/middlewares/auth.middleware';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import aclMiddleware from '@/middlewares/acl.middleware';
import {CreatePackageDto, PromotePackageDto} from '@/dtos/listingPackages.dto';

class AdminListingPackagesRoute implements Routes {
  public path = '/admin/packages';
  public router = Router();
  public listingPackageController = new ListingPackageController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(CreatePackageDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingPackageController.create
    );
    this.router.patch(
      `${this.path}/promote`,
      checkAPIVersion,
      validationMiddleware(PromotePackageDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingPackageController.listingPackagePromote
    );
    this.router.patch(
      `${this.path}/:id/promote/cancel`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.listingPackageController.listingPackageCancelPromote
    );
  }
}

export default AdminListingPackagesRoute;
