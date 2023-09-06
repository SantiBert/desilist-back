import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import PaymentsController from '@/controllers/payments.controller';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import {
  GetPaymentHistoryDto,
  CancelPaymentDto,
  ConfirmPaymentDto,
  CreatePaymentDto,
  CreateCardPaymentDto,
  ConfirmCardPaymentDto
} from '@/dtos/payments.dto';
import validationMiddleware from '@/middlewares/validation.middleware';

class PaymentsRoute implements Routes {
  public path = '/payments';
  public router = Router();
  public paymentsController = new PaymentsController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(CreatePaymentDto, 'body'),
      authMiddleware(),
      this.paymentsController.createPayment
    );
    this.router.get(
      `${this.path}/history`,
      checkAPIVersion,
      validationMiddleware(GetPaymentHistoryDto, 'body'),
      authMiddleware(),
      this.paymentsController.getPaymentHistory
    );
    this.router.post(
      `${this.path}/:id/confirm`,
      checkAPIVersion,
      validationMiddleware(ConfirmPaymentDto, 'body'),
      authMiddleware(),
      this.paymentsController.confirmPayment
    );
    this.router.post(
      `${this.path}/card`,
      checkAPIVersion,
      validationMiddleware(CreateCardPaymentDto, 'body'),
      authMiddleware(),
      this.paymentsController.createCardPayment
    );
    this.router.post(
      `${this.path}/card/:payment_intent_id/confirm`,
      checkAPIVersion,
      validationMiddleware(ConfirmCardPaymentDto, 'body'),
      authMiddleware(),
      this.paymentsController.confirmCardPayment
    );
    this.router.post(
      `${this.path}/:id/cancel`,
      checkAPIVersion,
      validationMiddleware(CancelPaymentDto, 'body'),
      authMiddleware(),
      this.paymentsController.cancelPayment
    );
  }
}

export default PaymentsRoute;
