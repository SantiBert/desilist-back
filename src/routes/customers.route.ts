import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import CustomersController from '@/controllers/customers.controller';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import {CreateCustomerDto, DeleteCustomerDto} from '@/dtos/payments.dto';
import validationMiddleware from '@/middlewares/validation.middleware';

class CustomersRoute implements Routes {
  public path = '/customers';
  public router = Router();
  public paymentsController = new CustomersController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(CreateCustomerDto, 'body'),
      authMiddleware(),
      this.paymentsController.createCustomer
    );
    this.router.delete(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(DeleteCustomerDto, 'body'),
      authMiddleware(),
      this.paymentsController.deleteCustomer
    );
  }
}

export default CustomersRoute;
