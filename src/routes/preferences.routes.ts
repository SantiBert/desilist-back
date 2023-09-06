import {Router} from 'express';
import PreferencesController from '@/controllers/preferences.controller';
import {UnsubscribeDto} from '@/dtos/preferences.dto';
import {Routes} from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';

class PreferencesRoute implements Routes {
  public path = '/preferences';
  public router = Router();
  public preferencesController = new PreferencesController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.patch(
      `${this.path}/unsubscribe`,
      checkAPIVersion,
      validationMiddleware(UnsubscribeDto, 'body'),
      authMiddleware(true),
      this.preferencesController.unsubscribe
    );
  }
}

export default PreferencesRoute;
