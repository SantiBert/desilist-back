import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import LocationController from '@/controllers/location.controllers';
import validationMiddleware from '@/middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';

class LocationRoute implements Routes {
  public path = '/event-locations';
  public router = Router();
  public locationController = new LocationController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}/search`,
      checkAPIVersion,
      authMiddleware(),
      this.locationController.getSearchLocation
    );
    this.router.get(
      `${this.path}/details`,
      checkAPIVersion,
      authMiddleware(),
      this.locationController.getLocationDetails
    );
  }
  
}

export default LocationRoute;
