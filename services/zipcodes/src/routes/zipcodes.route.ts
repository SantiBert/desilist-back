import {Router} from 'express';
import ZipcodesController from '@controllers/zipcodes.controller';
import {LocationDto} from '@/dtos/zipcodes.dto';
import {Routes} from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import {rateLimiterMiddleware} from '@/middlewares/rateLimiter';

class PublicRoute implements Routes {
  public path = '/';
  public router = Router();
  public zipcodesController = new ZipcodesController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}locations/:zip_code`,
      rateLimiterMiddleware,
      checkAPIVersion,
      validationMiddleware(LocationDto, 'params'),
      this.zipcodesController.locationByZipCode
    );
  }
}

export default PublicRoute;
