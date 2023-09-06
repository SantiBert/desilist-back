import {Router} from 'express';
import ListingPackageController from '@/controllers/listingPackages.controller';
import {Routes} from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import {UserRoles} from '@/constants/user.constants';
import authMiddleware from '@/middlewares/auth.middleware';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import aclMiddleware from '@/middlewares/acl.middleware';
import {CreatePackageDto} from '@/dtos/listingPackages.dto';

class ListingPackagesRoute implements Routes {
  public path = '/packages';
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
      aclMiddleware(UserRoles.USER),
      this.listingPackageController.create
    );
  }
}

export default ListingPackagesRoute;
