import Stripe from 'stripe';
import {PaymentGateway} from '@/utils/paymentGateway';
import {PAYMENT_METHOD_TYPE, PAYMENT_CANCEL_REASON} from '@/constants/payments';
import {logger} from '@utils/logger';
import {User} from '@prisma/client';
import {IBillingDetails, ICard, IPaymentAddress} from '@/interfaces/payments';
import {HttpException} from '@/exceptions/HttpException';

export class StripeService extends PaymentGateway {
  public constructor(apiKey: string, config: Stripe.StripeConfig) {
    super(apiKey);
    this.stripe = new Stripe(apiKey, config);
  }
  private stripe: Stripe;

  public async createPayment(
    amount: number,
    currency: string,
    paymentMethodType: PAYMENT_METHOD_TYPE[],
    customerId: string,
    paymentMethodOptions?: any,
    idempotencyKey?: string
  ): Promise<any> {
    // create a PaymentIntent with the order amount and currency.
    const params: Stripe.PaymentIntentCreateParams = {
      amount,
      currency,
      customer: customerId,
      confirmation_method: 'manual',
      payment_method_types: paymentMethodType
    };
    logger.info(`Creating a payment using ${paymentMethodType}`);

    if (paymentMethodOptions) {
      params.payment_method_options = paymentMethodOptions;
    }

    // if this is for an ACSS payment, we add payment_method_options to create
    // the Mandate.
    if (paymentMethodType.includes(PAYMENT_METHOD_TYPE.ACSS_DEBIT)) {
      params.payment_method_options = {
        acss_debit: {
          mandate_options: {
            payment_schedule: 'sporadic',
            transaction_type: 'personal'
          }
        }
      };
    } else if (
      paymentMethodType.includes(PAYMENT_METHOD_TYPE.CUSTOMER_BALANCE)
    ) {
      params.payment_method_data = {
        type: PAYMENT_METHOD_TYPE.CUSTOMER_BALANCE
      } as any;
      params.confirm = true;
      // params.customer =
      // req.body.customerId ||
      // (await this.stripe.customers.create().then((data: any) => data.id));
    } else if (paymentMethodType.includes(PAYMENT_METHOD_TYPE.CARD)) {
    }

    const createdPaymentIntent: Stripe.PaymentIntent =
      await this.stripe.paymentIntents.create(params, {
        idempotencyKey
      });

    logger.info(`Create payment status: ${createdPaymentIntent.status}`);

    return {
      paymentId: createdPaymentIntent.id,
      nextAction: createdPaymentIntent.next_action
    };
  }

  public async confirmPayment(
    id: string,
    paymentMethodId: string,
    user: User,
    paymentMethodOptions?: any,
    idempotencyKey?: string
  ): Promise<void> {
    const params: Stripe.PaymentIntentConfirmParams = {
      payment_method: paymentMethodId,
      receipt_email: user.email,
      payment_method_options: paymentMethodOptions
    };
    logger.info('Confirming a payment');

    try {
      const confirmedPaymentIntent: Stripe.PaymentIntent =
        await this.stripe.paymentIntents.confirm(id, params, {idempotencyKey});
      logger.info(`Confirm payment status: ${confirmedPaymentIntent.status}`);
    } catch (err) {
      throw new HttpException('payment_gw_error', err.statusCode, err.message);
    }
  }

  public async createCardPayment(
    customerId: string,
    amount: number,
    currency: string,
    paymentMethodOptions?: any,
    idempotencyKey?: string
  ): Promise<any> {
    // create a PaymentIntent with the order amount and currency.
    const params: Stripe.PaymentIntentCreateParams = {
      customer: customerId,
      amount,
      currency,
      confirmation_method: 'manual',
      confirm: false,
      payment_method_types: [PAYMENT_METHOD_TYPE.CARD]
    };

    logger.info(`Creating a payment using ${PAYMENT_METHOD_TYPE.CARD}`);

    if (paymentMethodOptions) {
      params.payment_method_options = paymentMethodOptions;
    }

    const createdPaymentIntent: Stripe.PaymentIntent =
      await this.stripe.paymentIntents.create(params, {
        idempotencyKey
      });

    logger.info(`Create payment status: ${createdPaymentIntent.status}`);

    return {
      paymentId: createdPaymentIntent.id,
      nextAction: createdPaymentIntent.next_action
    };
  }

  public async confirmCardPayment(
    id: string,
    paymentMethodId: string,
    user: User,
    paymentMethodOptions?: any,
    idempotencyKey?: string
  ): Promise<void> {
    const params: Stripe.PaymentIntentConfirmParams = {
      payment_method: paymentMethodId,
      receipt_email: user.email,
      payment_method_options: paymentMethodOptions
    };
    logger.info('Confirming a card payment');

    try {
      const confirmedPaymentIntent: Stripe.PaymentIntent =
        await this.stripe.paymentIntents.confirm(id, params, {idempotencyKey});
      logger.info(`Confirm payment status: ${confirmedPaymentIntent.status}`);
    } catch (err) {
      throw new HttpException('payment_gw_error', err.statusCode, err.message);
    }
  }

  public async cancelPayment(
    id: string,
    reason?: PAYMENT_CANCEL_REASON
  ): Promise<void> {
    const params: Stripe.PaymentIntentCancelParams = {
      cancellation_reason: reason || PAYMENT_CANCEL_REASON.REQUESTED_BY_CUSTOMER
    };
    logger.info('Canceling a payment');

    try {
      const canceledapymentIntent: Stripe.PaymentIntent =
        await this.stripe.paymentIntents.cancel(id, params);
      logger.info(`Cancel payment status: ${canceledapymentIntent.status}`);
    } catch (err) {
      throw new HttpException('payment_gw_error', err.statusCode, err.message);
    }
  }

  public async createCVCToken(cvc: string): Promise<string> {
    const params: Stripe.TokenCreateParams = {
      cvc_update: {cvc}
    };
    logger.info('Creating token');

    const cvcToken: Stripe.Token = await this.stripe.tokens.create(params);

    logger.info(`Token created`);

    return cvcToken.id;
  }

  public async createCustomer(
    user: Partial<User>,
    idempotencyKey?: string
  ): Promise<string> {
    const params: Stripe.CustomerCreateParams = {
      name: user.full_name || null,
      email: user.email || null,
      description: 'new customer'
    };
    logger.info('Creating a customer');

    const createdCustomer: Stripe.Customer = await this.stripe.customers.create(
      params,
      {idempotencyKey}
    );

    logger.info(`Create new customer with id: ${createdCustomer.id}`);
    return createdCustomer.id;
  }

  public async deleteCustomer(
    customerId: string
  ): Promise<Stripe.DeletedCustomer> {
    logger.info('Deleting a customer');

    const deletedCustomer: Stripe.DeletedCustomer =
      await this.stripe.customers.del(customerId);

    logger.info(
      `Deleted customer with id: ${deletedCustomer.id} - deleted: ${deletedCustomer.deleted}`
    );
    return deletedCustomer;
  }

  public async getPaymentMethod(
    customerId: string,
    type: PAYMENT_METHOD_TYPE
  ): Promise<Stripe.PaymentMethod[]> {
    const params: Stripe.CustomerListPaymentMethodsParams = {
      type: type
    };
    logger.info('Retrieving a payment method');

    const paymentMethodData = await this.stripe.customers.listPaymentMethods(
      customerId,
      params
    );

    logger.info(`Retrieving customer payment methods of type: ${type}`);

    return paymentMethodData.data;
  }

  public async createPaymentMethod(
    type: PAYMENT_METHOD_TYPE,
    card: ICard,
    billing_details: IBillingDetails
  ): Promise<string> {
    const params: Stripe.PaymentMethodCreateParams = {
      type: type,
      card: {
        number: card.number,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        cvc: card.cvc
      },
      billing_details
    };
    logger.info('Creating payment method');

    const createdPaymentMethod: Stripe.PaymentMethod =
      await this.stripe.paymentMethods.create(params);

    logger.info(
      `Created new payment method of type: ${createdPaymentMethod.type}`
    );
    return createdPaymentMethod.id;
  }

  public async updatePaymentMethod(
    paymentMethodId: string,
    address: IPaymentAddress,
    metadata?: Stripe.Emptyable<Stripe.MetadataParam>
  ): Promise<string> {
    const params: Stripe.PaymentMethodUpdateParams = {
      billing_details: {address},
      metadata
    };
    logger.info('Updating payment method');

    const updatedPaymentMethod: Stripe.PaymentMethod =
      await this.stripe.paymentMethods.update(paymentMethodId, params);

    logger.info(`Updated payment method of type: ${updatedPaymentMethod.type}`);
    return updatedPaymentMethod.id;
  }

  public async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<void> {
    logger.info('Attaching a payment method');

    const attachedPaymentMethod: Stripe.PaymentMethod =
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });

    logger.info(
      `Attached payment method of type: ${attachedPaymentMethod.type}`
    );
  }

  public async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    logger.info('Detaching a payment method');

    const detachedPaymentMethod: Stripe.PaymentMethod =
      await this.stripe.paymentMethods.detach(paymentMethodId);

    logger.info(
      `Detached payment method of type: ${detachedPaymentMethod.type}`
    );
  }
}
