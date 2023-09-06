import {NextFunction, Request, Response} from 'express';
import {StripeService, CustomerService} from '@/services';
import {STATUS_CODES} from '@/constants';
import config from '@/config';
import {
  CreatePaymentMethodDto,
  UpdatePaymentMethodBodyDto
} from '@/dtos/payments.dto';
import {PAYMENT_METHOD_TYPE} from '@/constants/payments';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {customerNotFoundException} from '@/errors/payments.error';

const STRIPE_API_KEY = config.payment_gateway.stripe.api_key;

class PaymentMethodsController {
  public stripe = new StripeService(STRIPE_API_KEY, {apiVersion: '2020-08-27'});
  public customers = new CustomerService();

  public getPaymentMethod = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const user = req.user;
      const paymentMethodType = req.params.type;

      const customer = await this.customers.findCustomerByUser(user.id);
      if (!customer) {
        throw customerNotFoundException('Customer not found');
      }

      const paymentMethods = await this.stripe.getPaymentMethod(
        customer.customer_id,
        paymentMethodType as PAYMENT_METHOD_TYPE
      );

      res
        .status(STATUS_CODES.OK)
        .json({data: paymentMethods, message: 'Payment method retrieved'});
    } catch (error) {
      next(error);
    }
  };

  public createPaymentMethod = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const paymentMethodData: CreatePaymentMethodDto = req.body;

      const createdPaymentMethodId = await this.stripe.createPaymentMethod(
        paymentMethodData.type,
        paymentMethodData.card,
        paymentMethodData.billing_details
      );

      res.status(STATUS_CODES.CREATED).json({
        data: {id: createdPaymentMethodId},
        message: 'Payment method created'
      });
    } catch (error) {
      next(error);
    }
  };

  public updatePaymentMethod = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const paymentMethodId = req.params.id;
      const paymentMethodData: UpdatePaymentMethodBodyDto = req.body;

      const createdPaymentMethodId = await this.stripe.updatePaymentMethod(
        paymentMethodId,
        paymentMethodData.address,
        paymentMethodData.metadata
      );

      res.status(STATUS_CODES.OK).json({
        data: {id: createdPaymentMethodId},
        message: 'Payment method updated'
      });
    } catch (error) {
      next(error);
    }
  };

  public attachPaymentMethod = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      const paymentMethodId = req.params.id;

      const customer = await this.customers.findCustomerByUser(user.id);
      if (!customer) {
        throw customerNotFoundException('Customer not found');
      }

      await this.stripe.attachPaymentMethod(
        customer.customer_id,
        paymentMethodId
      );

      res.status(STATUS_CODES.OK).json({message: 'Payment method attached'});
    } catch (error) {
      next(error);
    }
  };

  public detachPaymentMethod = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const paymentMethodId = req.params.id;

      await this.stripe.detachPaymentMethod(paymentMethodId);

      res.status(STATUS_CODES.OK).json({message: 'Payment method detached'});
    } catch (error) {
      next(error);
    }
  };
}

export default PaymentMethodsController;
