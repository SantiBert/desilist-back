import {NextFunction, Request, Response} from 'express';
import {
  StripeService,
  CustomerService,
  PaymentService,
  SubCategoryService
} from '@/services';
import {STATUS_CODES} from '@/constants';
import config from '@/config';
import {
  CancelPaymentDto,
  CreateCardPaymentDto,
  ConfirmCardPaymentDto,
  CreatePaymentDto,
  ConfirmPaymentDto
} from '@/dtos/payments.dto';
import {
  PAYMENT_CURRENCY,
  PAYMENT_METHOD_TYPE,
  PAYMENT_STATUS,
  PAYMENT_TYPE
} from '@/constants/payments';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {IdempotencyService} from '@/services/idempotency.service';
import {SubcategoriesPricringService} from '@/services/subcategoriesPricing.service';
import {BasicPricingPackageService} from '@/services/basicPricingPackages';
import {PromotePricingPackageService} from '@/services/promotePricingPackage';
import {ListingPackageService} from '@/services/listingPackage.service';
import {
  paymentAlreadyProcessedException,
  paymentNotFoundException
} from '@/errors/payments.error';
import {diffToNowInDays, getISONow} from '@/utils/time';

const STRIPE_API_KEY = config.payment_gateway.stripe.api_key;

class PaymentsController {
  public stripe = new StripeService(STRIPE_API_KEY, {apiVersion: '2020-08-27'});
  public customers = new CustomerService();
  public idempotency = new IdempotencyService();
  public payment = new PaymentService();
  public subcategoryPricing = new SubcategoriesPricringService();
  public basicPackage = new BasicPricingPackageService();
  public promotePackage = new PromotePricingPackageService();
  public listingPackage = new ListingPackageService();
  public subCategory = new SubCategoryService();

  public createPayment = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      const paymentData: CreatePaymentDto = req.body;

      const customer = await this.customers.findCustomerByUser(user.id);
      let customerId: string;
      if (!customer) {
        customerId = await this.stripe.createCustomer(user);
        await this.customers.createCustomer(customerId, user.id);
      }

      if (!paymentData.extend_time && !paymentData.basic_package_id) {
        throw Error('Server Error');
      }

      let paymentInfo = {
        amount: 0,
        currency: PAYMENT_CURRENCY.USD,
        basic: null,
        promote: null
      };

      if (!paymentData.extend_time) {
        paymentInfo = await this.paymentInformation(
          paymentData.subcategory_id,
          paymentData.base_price,
          paymentData.basic_package_id,
          paymentData.promote_package_id,
          paymentData.package_id
        );
      }

      for (const pdata of paymentData.extra_packages) {
        const pinfo = await this.paymentInformation(
          paymentData.subcategory_id,
          0,
          pdata.basic_package_id,
          pdata.promote_package_id,
          null
        );
        paymentInfo.amount += pinfo.amount;
      }

      const createdPaymentData = await this.stripe.createPayment(
        paymentInfo.amount,
        paymentInfo.currency,
        paymentData.method_type as PAYMENT_METHOD_TYPE[],
        customer ? customer.customer_id : customerId,
        paymentData.method_options
      );

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

      const createPaymentData = {
        id: createdPaymentData.paymentId,
        user_id: req.user.id,
        listing_id: paymentData.listing_id,
        idempotency_key_id: idempotencyKey.id,
        amount: paymentInfo.amount,
        basic_package_id: paymentInfo.basic,
        promote_package_id: paymentInfo.promote,
        extra_packages: paymentData.extra_packages,
        type: paymentData.extend_time ? PAYMENT_TYPE.EXTEND : null
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
      const paymentData: CreateCardPaymentDto = req.body;

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
      const paymentData: ConfirmCardPaymentDto = req.body;

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
      const paymentData: ConfirmPaymentDto = req.body;

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
        paymentData.key
      );

      if (payment.type !== PAYMENT_TYPE.EXTEND) {
        /* check if the package exists and we need to promote it only */
        const packToPromote = await this.listingPackage.findExistingPackage(
          payment.basic_package_id,
          payment.listing_id
        );

        if (!packToPromote) {
          const activePackage = await this.listingPackage.findActivePackage(
            payment.listing_id
          );
          const listingPackageData: any = {
            listing_id: payment.listing_id,
            basic_package_id: payment.basic_package_id,
            promote_package_id: payment.promote_package_id,
            active: activePackage ? false : true,
            activated_at: activePackage ? null : getISONow(),
            created_by: req.user.id
          };

          // todo validate if the package is created or not before insert (add idempotency key)
          await this.listingPackage.create(listingPackageData);
        } else {
          const updateListingPackageData: any = {
            promote_package_id: payment.promote_package_id,
            promoted_at: getISONow(),
            updated_by: req.user.id,
            updated_at: getISONow()
          };
          await this.listingPackage.updateById(
            packToPromote.id,
            updateListingPackageData
          );
        }
      }

      /* after all, add extra packages */
      for (const extraPack of payment.extra_packages) {
        const listingExtraPackageData: any = {
          listing_id: payment.listing_id,
          basic_package_id: extraPack['basic_package_id'],
          promote_package_id: extraPack['promote_package_id'],
          created_by: req.user.id
        };
        await this.listingPackage.create(listingExtraPackageData);
      }
      await this.payment.update(id, PAYMENT_STATUS.FINISHED);

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
      const paymentData: CancelPaymentDto = req.body;

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
    basicPricingId: number,
    promotePricingId: number | null,
    packageId: number | null
  ): Promise<any> {
    const basicPackage = await this.basicPackage.find(basicPricingId);
    const promotePackage = promotePricingId
      ? await this.promotePackage.find(promotePricingId)
      : null;
    let subcategoryPricing: any, amount: number, subcategoryFree: any;

    const subCategory = await this.subCategory.findById(subcategoryId);
    if (promotePricingId) {
      subcategoryPricing =
        await this.subcategoryPricing.findSubcatiegoryPricing(
          subcategoryId,
          basicPricingId,
          promotePricingId
        );
      /* fix: handle this with one call to db */
      subcategoryFree = await this.subcategoryPricing.findSubcatiegoryPricing(
        subcategoryId,
        1,
        1
      );
      if (packageId) {
        const pack = await this.listingPackage.find(packageId);
        const diff = Math.floor(Math.abs(diffToNowInDays(pack.activated_at)));
        amount =
          subcategoryFree.promote_per_day * (promotePackage.duration - diff);
      } else {
        amount = subCategory.free
          ? subcategoryFree.promote_per_day * promotePackage.duration
          : subcategoryPricing.basic_per_day * basicPackage.duration +
            subcategoryPricing.promote_per_day * promotePackage.duration;
      }
    } else {
      subcategoryPricing =
        await this.subcategoryPricing.findSubcategoryPricingBasic(
          subcategoryId,
          basicPricingId
        );

      amount = subcategoryPricing.basic_per_day * basicPackage.duration;
    }

    return {
      // amount: Math.ceil(basePrice + amount),
      amount: basePrice + amount,
      currency: PAYMENT_CURRENCY.USD,
      basic: basicPricingId,
      promote: promotePricingId ? promotePricingId : null
    };
  }
}

export default PaymentsController;
