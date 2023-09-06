import {NextFunction, Request, Response} from 'express';
import {
  StripeService,
  CustomerService,
  EventPaymentService,
  EventPriceService,
  EventSubCategoryService,
  EventsService,
  TicketService
} from '@/services';
import {STATUS_CODES} from '@/constants';
import config from '@/config';
import {
  CancelEventPaymentDto,
  CreateCardEventPaymentDto,
  ConfirmCardEventPaymentDto,
  CreateEventPaymentDto,
  ConfirmEventPaymentDto
} from '@/dtos/eventPayment.dto';
import {
  PAYMENT_CURRENCY,
  PAYMENT_METHOD_TYPE,
  PAYMENT_STATUS,
  PAYMENT_TYPE
} from '@/constants/payments';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {IdempotencyService} from '@/services/idempotency.service';
import {NotificationService} from '@/services/notification.service';
import {PromotePricingPackageService} from '@/services/promotePricingPackage';
import {
  paymentAlreadyProcessedException,
  paymentNotFoundException
} from '@/errors/payments.error';
import {diffToNowInDays, getISONow} from '@/utils/time';
import { UserRoles } from '@/constants/user.constants';
import {NOTIFICATION_TYPE} from '@/constants/notifications';
import {
  EventPrice,
  EventSubcategory,
  PromotePricingPackage
} from '@prisma/client';
import {Decimal} from '@prisma/client/runtime';
import {EventPackageService} from '@/services/eventPackage.service';
import notifications from '@/notifications';
import { LISTING_STATUS } from '@/constants/listingStatus';

const STRIPE_API_KEY = config.payment_gateway.stripe.api_key;

class EventPaymentsController {
  public stripe = new StripeService(STRIPE_API_KEY, {apiVersion: '2020-08-27'});
  public customers = new CustomerService();
  public idempotency = new IdempotencyService();
  public payment = new EventPaymentService();
  public subcategoryPricing = new EventPriceService();
  public promotePackage = new PromotePricingPackageService();
  public eventPackage = new EventPackageService();
  public subCategory = new EventSubCategoryService();
  public events = new EventsService();
  public ticket = new TicketService();

  public createPayment = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      const paymentData: CreateEventPaymentDto = req.body;

      const customer = await this.customers.findCustomerByUser(user.id);
      const event:any = await this.events.findById(paymentData.event_id);
      let customerId: string;
      if (!customer) {
        customerId = await this.stripe.createCustomer(user);
        await this.customers.createCustomer(customerId, user.id);
      }

      let paymentInfo = {
        amount: 0,
        currency: PAYMENT_CURRENCY.USD,
        basic: null,
        promote: null
      };

      const promoteOnly = event.status.id === LISTING_STATUS.ACTIVE ? true : false; 

      paymentInfo = await this.paymentInformation(
        paymentData.subcategory_id,
        paymentData.base_price,
        paymentData.promote_package_id,
        promoteOnly
      );

      const createdPaymentData = await this.stripe.createPayment(
        paymentInfo.amount,
        paymentInfo.currency,
        paymentData.method_type as PAYMENT_METHOD_TYPE[],
        customer ? customer.customer_id : customerId,
        paymentData.method_options
      );

      /*
      const createIdempotencyKeyData = {
        value: this.idempotency.getIdempotencyKey(),
        request_path: req.path,
        request_params: JSON.stringify(req.params),
        response_code: 0,
        response_body: '',
        recovery_point: ''
      };
      const idempotencyKey = await this.idempotency.create(
        createIdempotencyKeyData as any
      );
      */

      const createPaymentData = {
        id: createdPaymentData.paymentId,
        user_id: req.user.id,
        event_id: paymentData.event_id,
        // idempotency_key_id: idempotencyKey.id,
        amount: paymentInfo.amount,
        // basic_package_id: paymentInfo.basic,
        promote_package_id: paymentInfo.promote
      };
      const createdPayment = await this.payment.create(
        createPaymentData as any
      );

      res
        .status(STATUS_CODES.CREATED)
        .json({data: createdPayment, message: 'Payment created'});
    } catch (error) {
      next(error);
    }
  };

  public getPaymentHistory = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const params = req.query;

      const payementHistory = await this.payment.findFinishedByUserId(
        userId,
        params
      );

      res
        .status(STATUS_CODES.OK)
        .json({data: payementHistory, message: 'History retrieved'});
    } catch (error) {
      next(error);
    }
  };

  public createCardPayment = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      const paymentData: CreateCardEventPaymentDto = req.body;

      const customer = await this.customers.findCustomerByUser(user.id);
      let customerId: string;
      if (!customer) {
        customerId = await this.stripe.createCustomer(user);
        await this.customers.createCustomer(customerId, user.id);
      }

      const createdPaymentData = await this.stripe.createCardPayment(
        customer.customer_id,
        paymentData.amount,
        paymentData.currency,
        paymentData.method_options
      );

      res
        .status(STATUS_CODES.CREATED)
        .json({data: createdPaymentData, message: 'Payment created'});
    } catch (error) {
      next(error);
    }
  };

  public confirmCardPayment = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.payment_intent_id;
      const user = req.user;
      const paymentData: ConfirmCardEventPaymentDto = req.body;

      const paymentMethodOpts = {
        card: {cvc_token: paymentData.method_options.cvc_token_id}
      };
      
      await this.stripe.confirmCardPayment(
        id,
        paymentData.payment_method_id,
        user,
        paymentMethodOpts
      );

      res.status(STATUS_CODES.OK).json({message: 'Payment confirmed'});
    } catch (error) {
      next(error);
    }
  };

  public confirmPayment = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const user = req.user;
      const paymentData: ConfirmEventPaymentDto = req.body;

      const payment = await this.payment.find(id);
      if (!payment) {
        throw paymentNotFoundException('Payment not found');
      }

      if (payment.status !== PAYMENT_STATUS.PENDING) {
        throw paymentAlreadyProcessedException(
          'Cannot confirm a payment already processed'
        );
      }

      // todo: add payment_intent - idempotency key validation
      let paymentMethodOpts = {};

      if (paymentData.method_type) {
        paymentMethodOpts = {
          card: {cvc_token: paymentData.method_options.cvc_token_id}
        };
      }

      await this.stripe.confirmPayment(
        id,
        paymentData.payment_method_id,
        user,
        paymentMethodOpts,
        // paymentData.key
      );

      /* check if the package exists and we need to promote it only */
      /* does not apply to events */
      // const packToPromote = await this.eventPackage.findExistingPackage(
      //   payment.promote_package_id,
      //   payment.event_id
      // );

      const activePackage = await this.eventPackage.findActivePackage(
        payment.event_id
      );
      if (payment.promote_package_id) {
        const eventPackageData: any = {
          event_id: payment.event_id,
          promote_package_id: payment.promote_package_id,
          active: activePackage ? false : true,
          activated_at: activePackage ? null : getISONow(),
          created_by: req.user.id
        };
        await this.eventPackage.create(eventPackageData);
      }

      await this.payment.update(id, PAYMENT_STATUS.FINISHED);
      /*
      let response = await this.payment.update(id, PAYMENT_STATUS.FINISHED);

      if (response){
        await this.sendNotifications(id, payment.event_id)
      }
      */

      res.status(STATUS_CODES.OK).json({message: 'Payment confirmed'});
    } catch (error) {
      next(error);
    }
  };

  public cancelPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const paymentData: CancelEventPaymentDto = req.body;

      const payment = await this.payment.find(id);
      if (!payment) {
        throw paymentNotFoundException('Payment not found');
      }

      // todo: add cancel validations

      await this.stripe.cancelPayment(id, paymentData.reason);
      await this.payment.update(id, PAYMENT_STATUS.CANCELED);

      res.status(STATUS_CODES.OK).json({message: 'Payment canceled'});
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  private async paymentInformation(
    subcategoryId: number,
    basePrice: number,
    promotePricingId: number | null,
    // packageId: number | null
    promoteOnly: boolean
  ): Promise<any> {
    const promotePackage: Partial<PromotePricingPackage> | null =
      promotePricingId
        ? await this.promotePackage.find(promotePricingId)
        : null;
    let subcategoryPricing: any, amount: number, subcategoryFree: any;

    const subCategory: Partial<EventSubcategory> =
      await this.subCategory.findById(subcategoryId);
    if (promotePricingId) {
      subcategoryPricing = await this.subcategoryPricing.findSubcategoryPricing(
        subcategoryId,
        promotePricingId
      );
      /* fix: handle this with one call to db */
      // this variable is used to calculate when the event is already published
      // and want to promote the days left. Always use the 14 day package.
      /*/
      subcategoryFree = await this.subcategoryPricing.findSubcategoryPricing(
        subcategoryId,
        1
      );
      */

      // Only Promote an Active Event or Publish with Promote in a free category
      if (promoteOnly || (subCategory.is_free && promotePricingId)) {
        amount = subcategoryPricing.promote_per_day * promotePackage.duration;
      }
      // Publish in a paid Category and Promote
      if (!subCategory.is_free && !promoteOnly) {
        amount = subCategory.event_publication_price + (subcategoryPricing.promote_per_day * promotePackage.duration);
      }     

    } else {
      // if the Event doesn't have a Promote package, only apply the even_publication_price
      amount = subCategory.event_publication_price;
    }

    return {
      // amount: Math.ceil(basePrice + amount),
      amount: basePrice + amount,
      currency: PAYMENT_CURRENCY.USD,
      promote: promotePricingId ? promotePricingId : null
    };
  }
}

export default EventPaymentsController;
