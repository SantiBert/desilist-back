import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import SubCategoriesController from '@/controllers/admin/subCategories.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import {
  CreateSubCategoryDto,
  DeleteSubCategoryDto,
  UpdateSubCategoryDto,
  UpdateSubCategoryOrderDto
} from '@/dtos/subCategories.dto';
import aclMiddleware from '@/middlewares/acl.middleware';
import {UserRoles} from '@/constants';
import authMiddleware from '@/middlewares/auth.middleware';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';

class AdminSubCategoriesRoute implements Routes {
  public path = '/admin/subcategories';
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
    this.router.post(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(CreateSubCategoryDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.subCategoriesController.createSubCategory
    );
    this.router.put(
      `${this.path}/:id`,
      checkAPIVersion,
      validationMiddleware(UpdateSubCategoryDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.subCategoriesController.updateSubCategory
    );
    this.router.delete(
      `${this.path}/:id`,
      checkAPIVersion,
      validationMiddleware(DeleteSubCategoryDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.subCategoriesController.deleteSubCategory
    );
    this.router.patch(
      `${this.path}/order`,
      checkAPIVersion,
      validationMiddleware(UpdateSubCategoryOrderDto, 'body', true),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.subCategoriesController.updateSubCategoryOrder
    );
  }
}

export default AdminSubCategoriesRoute;
