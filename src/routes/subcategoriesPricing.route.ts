import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import {SubcategoriesPricingController} from '@/controllers/subcategoriesPricing.controller';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import {GetBySubcategoryDto} from '@/dtos/subcategoriesPricing.dto';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { EventSubcategoriesPricingController } from '@/controllers/eventSubcategoriesPricing.controller';

class SubcategoriesPricingRoute implements Routes {
  public path = '/pricing';
  public router = Router();
  public subCategoriesController = new SubcategoriesPricingController();
  public eventSubCategoriesController = new EventSubcategoriesPricingController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}/subcategory/:id`,
      checkAPIVersion,
      validationMiddleware(GetBySubcategoryDto, 'params'),
      authMiddleware(),
      this.subCategoriesController.findPricingBySubcategory
    );

    this.router.get(
      `${this.path}/event/:id`,
      checkAPIVersion,
      validationMiddleware(GetBySubcategoryDto, 'params'),
      authMiddleware(),
      this.eventSubCategoriesController.findPricingBySubcategory
    );
  }
  
}

export default SubcategoriesPricingRoute;
