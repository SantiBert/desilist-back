import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import CategoriesController from '@/controllers/categories.controller';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';

class CategoriesRoute implements Routes {
  public path = '/categories';
  public router = Router();
  public categoriesController = new CategoriesController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      checkAPIVersion,
      this.categoriesController.getCategories
    );
    this.router.get(
      `${this.path}/:id`,
      checkAPIVersion,
      this.categoriesController.getCategoryById
    );
  }
}

export default CategoriesRoute;
