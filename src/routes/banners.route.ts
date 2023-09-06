import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import BannersController from '@/controllers/admin/banners.controller';
// import authMiddleware from '@middlewares/auth.middleware';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';

class BannersRoute implements Routes {
  public path = '/banners';
  public router = Router();
  public bannersController = new BannersController();

  public constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      checkAPIVersion,
      // authMiddleware(true),
      this.bannersController.getBanners
    );
  }
}

export default BannersRoute;
