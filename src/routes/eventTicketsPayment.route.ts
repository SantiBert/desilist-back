import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import {
    CancelEventPaymentDto,
    CreateCardEventPaymentDto,
    ConfirmCardEventTicketPaymentDto,
    CreateEventTicketPaymentDto,
    ConfirmEventPaymentDto
  } from '@/dtos/eventTicketPayment.dto';
import validationMiddleware from '@/middlewares/validation.middleware';
import { GetPaymentHistoryDto } from '@/dtos/payments.dto';
import EventTicketsPaymentsController from '@/controllers/eventTicketsPayments.controller';

class EventTicketsPaymentsRoute implements Routes {
  public path = '/ticket/payments';
  public router = Router();
  public eventTicketsPaymentsController = new EventTicketsPaymentsController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(CreateEventTicketPaymentDto, 'body'),
      authMiddleware(),
      this.eventTicketsPaymentsController.createPayment
    );
    this.router.get(
      `${this.path}/history`,
      checkAPIVersion,
      validationMiddleware(GetPaymentHistoryDto, 'body'),
      authMiddleware(),
      this.eventTicketsPaymentsController.getPaymentHistory
    );

    this.router.post(
      `${this.path}/:id/confirm`,
      checkAPIVersion,
      validationMiddleware(ConfirmEventPaymentDto, 'body'),
      authMiddleware(),
      this.eventTicketsPaymentsController.confirmPayment
    );
    this.router.post(
      `${this.path}/card`,
      checkAPIVersion,
      validationMiddleware(CreateCardEventPaymentDto, 'body'),
      authMiddleware(),
      this.eventTicketsPaymentsController.createCardPayment
    );
    this.router.post(
      `${this.path}/card/:payment_intent_id/confirm`,
      checkAPIVersion,
      validationMiddleware(ConfirmCardEventTicketPaymentDto, 'body'),
      authMiddleware(),
      this.eventTicketsPaymentsController.confirmCardPayment
    );
    this.router.post(
      `${this.path}/:id/cancel`,
      checkAPIVersion,
      validationMiddleware(CancelEventPaymentDto, 'param'),
      authMiddleware(),
      this.eventTicketsPaymentsController.cancelPayment
    );

  }
}

export default EventTicketsPaymentsRoute;
