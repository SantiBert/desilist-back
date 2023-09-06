import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import AdminEventSubcategoryController from '@/controllers/admin/eventSubcategories.controller';
import {checkAPIVersion, } from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import aclMiddleware from '@/middlewares/acl.middleware';
import {UserRoles} from '@/constants/user.constants';

import {
    CreateEventSubcategoryDto,
    UpdateEventSubCategoryOrderDto,
    UpdateEventSubcategoryDto
  } from '@/dtos/eventSubCategories.dto';
  

class AdminEventSubcategoryRoute implements Routes {
    public path = '/admin/events/subcategories';
    public router = Router();
    public eventSubcategoryController = new AdminEventSubcategoryController();

    public constructor() {
        this.initializeRoutes();
    }
    
    private initializeRoutes(): void {
      this.router.post(
        `${this.path}/`,
        checkAPIVersion,
        validationMiddleware(CreateEventSubcategoryDto, 'body'),
        authMiddleware(),
        aclMiddleware(UserRoles.ADMIN),
        this.eventSubcategoryController.createEventSubCategory
      );
      this.router.put(
        `${this.path}/:id`,
        checkAPIVersion,
        validationMiddleware(UpdateEventSubcategoryDto, 'body'),
        authMiddleware(),
        aclMiddleware(UserRoles.ADMIN),
        this.eventSubcategoryController.updateEventSubcategory
      );
      this.router.delete(
        `${this.path}/:id`,
        checkAPIVersion,
        authMiddleware(),
        aclMiddleware(UserRoles.ADMIN),
        this.eventSubcategoryController.deleteEventSubcategory
      );
      this.router.patch(
        `${this.path}/order`,
        checkAPIVersion,
        validationMiddleware(UpdateEventSubCategoryOrderDto, 'body', true),
        authMiddleware(),
        aclMiddleware(UserRoles.ADMIN),
        this.eventSubcategoryController.updateEventSubCategoryOrder
      );
  }
  
}

export default AdminEventSubcategoryRoute;