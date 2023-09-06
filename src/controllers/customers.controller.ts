import {NextFunction, Response} from 'express';
import {StripeService, CustomerService} from '@/services';
import {STATUS_CODES} from '@/constants';
import config from '@/config';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {
  customerAlreadyExistsException,
  customerNotFoundException
} from '@/errors/payments.error';
import {IdempotencyService} from '@/services/idempotency.service';

const STRIPE_API_KEY = config.payment_gateway.stripe.api_key;

class CustomersController {
  public stripe = new StripeService(STRIPE_API_KEY, {apiVersion: '2020-08-27'});
  public customers = new CustomerService();
  public idempotency = new IdempotencyService();

  public createCustomer = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      // const customerData: CreateCustomerDto = req.body;

      const customer = await this.customers.findCustomerByUser(user.id);
      if (customer) {
        throw customerAlreadyExistsException('Customer already exists');
      }

      const idempotency = await this.idempotency.initIdempotentRequest(
        user.id,
        {
          request_params: JSON.stringify(req.params),
          request_path: req.path
        }
      );

      const customerId = await this.idempotency.executeOperation(
        idempotency.id,
        this.stripe,
        'createCustomer',
        [
          {
            full_name: user.full_name,
            email: user.email
          },
          idempotency.key
        ],
        'create_customer'
      );

      await this.idempotency.executeOperation(
        idempotency.id,
        this.customers,
        'createCustomer',
        [
          {
            customer_id: customerId,
            user_id: user.id
          }
        ],
        'create_customer_local'
      );
      // await this.customers.createCustomer(customerId, user.id);
      await this.idempotency.endIdempotentRequest(idempotency.id);

      res
        .status(STATUS_CODES.CREATED)
        .json({data: {customer_id: customerId}, message: 'Customer created'});
    } catch (error) {
      next(error);
    }
  };

  public deleteCustomer = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      // const customerData: CreateCustomerDto = req.body;

      const customer = await this.customers.findCustomerByUser(user.id);
      if (!customer) {
        throw customerNotFoundException('Customer not found');
      }

      const deletedCustomer = await this.stripe.deleteCustomer(
        customer.customer_id
      );
      await this.customers.deleteCustomerById(deletedCustomer.id);

      res.status(STATUS_CODES.OK).json({message: 'Customer deleted'});
    } catch (error) {
      next(error);
    }
  };
}

export default CustomersController;
