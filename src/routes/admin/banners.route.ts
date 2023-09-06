import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import BannersController from '@/controllers/admin/banners.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import {CreateBannerDto, UpdateBannerDto} from '@/dtos/banners.dto';
import aclMiddleware from '@/middlewares/acl.middleware';
import {UserRoles} from '@/constants/user.constants';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';

class AdminBannersRoute implements Routes {
  public path = '/admin/banners';
  public router = Router();
  public bannersController = new BannersController();

  public constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.bannersController.getBannersAdmin
    );
    this.router.post(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(CreateBannerDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.bannersController.createBanner
    );
    this.router.patch(
      `${this.path}/:id`,
      checkAPIVersion,
      validationMiddleware(UpdateBannerDto, 'body', true),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.bannersController.updateBanner
    );
    this.router.delete(
      `${this.path}/:id`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.bannersController.deleteBanner
    );
    this.router.patch(
      `${this.path}/:id/paused`,
      checkAPIVersion,
      validationMiddleware(UpdateBannerDto, 'body', true),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.bannersController.pausedBanner
    );
  }
}

export default AdminBannersRoute;
