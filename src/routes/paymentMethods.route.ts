import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import PaymentMethodsController from '@/controllers/paymentMethods.controller';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import {
  AttachPaymentMethodDto,
  CreatePaymentMethodDto,
  UpdatePaymentMethodPathDto,
  UpdatePaymentMethodBodyDto,
  DetachPaymentMethodDto,
  GetPaymentMethodDto
} from '@/dtos/payments.dto';
import validationMiddleware from '@/middlewares/validation.middleware';

class PaymentMethodsRoute implements Routes {
  public path = '/payment_methods';
  public router = Router();
  public paymentsMethodsController = new PaymentMethodsController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}/:type`,
      checkAPIVersion,
      validationMiddleware(GetPaymentMethodDto, 'params'),
      authMiddleware(),
      this.paymentsMethodsController.getPaymentMethod
    );
    this.router.post(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(CreatePaymentMethodDto, 'body'),
      authMiddleware(),
      this.paymentsMethodsController.createPaymentMethod
    );
    this.router.patch(
      `${this.path}/:id`,
      checkAPIVersion,
      validationMiddleware(UpdatePaymentMethodPathDto, 'params'),
      validationMiddleware(UpdatePaymentMethodBodyDto, 'body'),
      authMiddleware(),
      this.paymentsMethodsController.updatePaymentMethod
    );
    this.router.post(
      `${this.path}/:id/attach`,
      checkAPIVersion,
      validationMiddleware(AttachPaymentMethodDto, 'params'),
      authMiddleware(),
      this.paymentsMethodsController.attachPaymentMethod
    );
    this.router.post(
      `${this.path}/:id/detach`,
      checkAPIVersion,
      validationMiddleware(DetachPaymentMethodDto, 'params'),
      authMiddleware(),
      this.paymentsMethodsController.detachPaymentMethod
    );
  }
}

export default PaymentMethodsRoute;
