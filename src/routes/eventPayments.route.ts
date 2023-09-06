import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import {
  GetEventPaymentHistoryDto,
  CancelEventPaymentDto,
  ConfirmEventPaymentDto,
  CreateEventPaymentDto,
  CreateCardEventPaymentDto,
  ConfirmCardEventPaymentDto
} from '@/dtos/eventPayment.dto';
import validationMiddleware from '@/middlewares/validation.middleware';
import EventPaymentsController from '@/controllers/eventPayments.controller';

class EventPaymentsRoute implements Routes {
  public path = '/event/payments';
  public router = Router();
  public paymentsController = new EventPaymentsController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(CreateEventPaymentDto, 'body'),
      authMiddleware(),
      this.paymentsController.createPayment
    );
    this.router.get(
      `${this.path}/history`,
      checkAPIVersion,
      validationMiddleware(GetEventPaymentHistoryDto, 'body'),
      authMiddleware(),
      this.paymentsController.getPaymentHistory
    );
    this.router.post(
      `${this.path}/:id/confirm`,
      checkAPIVersion,
      validationMiddleware(ConfirmEventPaymentDto, 'body'),
      authMiddleware(),
      this.paymentsController.confirmPayment
    );
    this.router.post(
      `${this.path}/card`,
      checkAPIVersion,
      validationMiddleware(CreateCardEventPaymentDto, 'body'),
      authMiddleware(),
      this.paymentsController.createCardPayment
    );
    this.router.post(
      `${this.path}/card/:payment_intent_id/confirm`,
      checkAPIVersion,
      validationMiddleware(ConfirmCardEventPaymentDto, 'body'),
      authMiddleware(),
      this.paymentsController.confirmCardPayment
    );
    this.router.post(
      `${this.path}/:id/cancel`,
      checkAPIVersion,
      validationMiddleware(CancelEventPaymentDto, 'body'),
      authMiddleware(),
      this.paymentsController.cancelPayment
    );
  }
}

export default EventPaymentsRoute;
