import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import DesilistTermsController from '@/controllers/desilistTerms.controller';
import {checkAPIVersion, } from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';


import {
  CreateDesilistTermsDto,
  UpdateDesilistTermsDto,
  DeleteDesilistTermsDto,
  GetDesilistTermsDto
  } from '@/dtos/desilistTerms.dto';
  

class DesilistTermsRoute implements Routes {
    public path = '/deslist-terms';
    public router = Router();
    public desilistTermsController = new DesilistTermsController();

    public constructor() {
        this.initializeRoutes();
    }
    
    private initializeRoutes(): void {
      this.router.get(
        `${this.path}`,
        checkAPIVersion,
        validationMiddleware(GetDesilistTermsDto, 'body'),
        //authMiddleware(),
        this.desilistTermsController.getAllDesilistTerm
      );
      this.router.get(
        `${this.path}/:id`,
        checkAPIVersion,
        validationMiddleware(GetDesilistTermsDto, 'body'),
        //authMiddleware(),
        this.desilistTermsController.getDesilistTerm
      );
  }
  
}

export default DesilistTermsRoute;