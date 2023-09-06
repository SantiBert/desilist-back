import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import AdminDesilistTermsController from '@/controllers/admin/desilistTerms.controller';
import {checkAPIVersion, } from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';


import {
  CreateDesilistTermsDto,
  UpdateDesilistTermsDto,
  DeleteDesilistTermsDto,
  GetDesilistTermsDto
  } from '@/dtos/desilistTerms.dto';
import aclMiddleware from '@/middlewares/acl.middleware';
import { UserRoles } from '@/constants';

class AdminDesilistTermsRoute implements Routes {
    public path = '/admin/desilist-terms';
    public router = Router();
    public desilistTermsController = new AdminDesilistTermsController();

    public constructor() {
        this.initializeRoutes();
    }
    
    private initializeRoutes(): void {
      this.router.post(
        `${this.path}`,
        checkAPIVersion,
        validationMiddleware(CreateDesilistTermsDto, 'body'),
        authMiddleware(),
        aclMiddleware(UserRoles.ADMIN),
        this.desilistTermsController.createDesilistTerm
      );
      this.router.patch(
        `${this.path}/:id`,
        checkAPIVersion,
        validationMiddleware(UpdateDesilistTermsDto, 'body'),
        authMiddleware(),
        aclMiddleware(UserRoles.ADMIN),
        this.desilistTermsController.updateDesilistTerm
      );
      this.router.delete(
        `${this.path}/:id`,
        checkAPIVersion,
        validationMiddleware(DeleteDesilistTermsDto, 'body'),
        authMiddleware(),
        aclMiddleware(UserRoles.ADMIN),
        this.desilistTermsController.deleteDesilistTerm
      );
  }
  
}

export default AdminDesilistTermsRoute;