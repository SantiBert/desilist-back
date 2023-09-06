import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import SubCategoriesController from '@/controllers/subCategories.controller';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';

import authMiddleware from '@/middlewares/auth.middleware';

class SubCategoriesRoute implements Routes {
  public path = '/subcategories';
  public router = Router();
  public subCategoriesController = new SubCategoriesController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      checkAPIVersion,
      this.subCategoriesController.getSubCategories
    );
    this.router.get(
      `${this.path}/:id`,
      checkAPIVersion,
      this.subCategoriesController.getSubCategoryById
    );
  }
}

export default SubCategoriesRoute;
