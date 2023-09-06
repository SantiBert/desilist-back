import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import CategoriesController from '@/controllers/admin/categories.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoryOrderDto
} from '@/dtos/categories.dto';
import aclMiddleware from '@/middlewares/acl.middleware';
import {UserRoles} from '../../constants/user.constants';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';

class AdminCategoriesRoute implements Routes {
  public path = '/admin/categories';
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
    this.router.post(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(CreateCategoryDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.categoriesController.createCategory
    );
    this.router.put(
      `${this.path}/:id`,
      checkAPIVersion,
      validationMiddleware(UpdateCategoryDto, 'body', true),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.categoriesController.updateCategory
    );
    this.router.delete(
      `${this.path}/:id`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.categoriesController.deleteCategory
    );
    this.router.patch(
      `${this.path}/order`,
      checkAPIVersion,
      validationMiddleware(UpdateCategoryOrderDto, 'body', true),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.categoriesController.updateCategoryOrder
    );
  }
}

export default AdminCategoriesRoute;
