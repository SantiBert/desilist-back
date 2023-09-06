import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import {rateLimiterMiddleware} from '@/middlewares/rateLimiter';
import TimezoneController from '@/controllers/timezone.controller';

class TimezoneRoute implements Routes {
  public path = '/timezones';
  public router = Router();
  public timezoneController = new TimezoneController();

  public constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes(): void {
    this.router.get(
        `${this.path}`,
        checkAPIVersion,
        this.timezoneController.getTimezones
    );
    this.router.get(
        `${this.path}/:id`,
        checkAPIVersion,
        this.timezoneController.getTimezoneById
    );
  }
}

export default TimezoneRoute;