import {Router} from 'express';
import PublicController from '@controllers/public.controller';
import {
  ContactWithCaptcha,
  LocationDto,
  PhoneNumberDto
} from '@/dtos/public.dto';
import {Routes} from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import {rateLimiterMiddleware} from '@/middlewares/rateLimiter';

class PublicRoute implements Routes {
  public path = '/';
  public router = Router();
  public publicController = new PublicController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}contact_us`,
      rateLimiterMiddleware,
      checkAPIVersion,
      validationMiddleware(ContactWithCaptcha, 'body'),
      this.publicController.contactUs
    );
    this.router.get(
      `${this.path}locations/:zip_code`,
      rateLimiterMiddleware,
      checkAPIVersion,
      validationMiddleware(LocationDto, 'params'),
      this.publicController.locationByZipCode
    );
    this.router.post(
      `${this.path}validate_phone`,
      rateLimiterMiddleware,
      checkAPIVersion,
      validationMiddleware(PhoneNumberDto, 'body'),
      this.publicController.validatePhoneNumber
    );
  }
}

export default PublicRoute;
