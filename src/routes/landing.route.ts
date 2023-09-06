import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import {checkAPIVersion, } from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import LandingController from '@/controllers/landing.controller';
 

class LandingRoute implements Routes {
    public path = '/landing';
    public router = Router();
    public landingController = new LandingController();

    public constructor() {
        this.initializeRoutes();
    }
    
    private initializeRoutes(): void {
      this.router.get(
        `${this.path}/highlighted`,
        checkAPIVersion,
        this.landingController.getLandingHighlighted
      );
  }
  
}

export default LandingRoute;