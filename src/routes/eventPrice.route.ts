import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import EventPriceController from '@/controllers/eventPrice.controller';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';

import {GetBySubcategoryDto} from '@/dtos/eventPrice.dto';

class EventPriceRoute implements Routes {
  public path = '/event/pricing';
  public router = Router();
  public eventPriceController = new EventPriceController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}/subcategory/:id`,
      checkAPIVersion,
      validationMiddleware(GetBySubcategoryDto, 'params'),
      authMiddleware(),
      this.eventPriceController.findPricingBySubcategory
    );
  }
}

export default EventPriceRoute;
