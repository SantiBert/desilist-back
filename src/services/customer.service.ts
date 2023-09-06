import {PaymentCustomer} from '@prisma/client';
import prisma from '@/db';

export class CustomerService {
  public paymentCustomer = prisma.paymentCustomer;

  public async findCustomerById(
    id: string
  ): Promise<Partial<PaymentCustomer> | null> {
    return await this.paymentCustomer.findUnique({
      select: {user_id: true},
      where: {customer_id: id}
    });
  }

  public async findCustomerByUser(
    userId: string
  ): Promise<Partial<PaymentCustomer> | null> {
    return await this.paymentCustomer.findUnique({
      select: {customer_id: true},
      where: {user_id: userId}
    });
  }

  public async createCustomer(
    customerId: string,
    userId: string
  ): Promise<Partial<PaymentCustomer> | null> {
    return await this.paymentCustomer.create({
      select: {customer_id: true},
      data: {customer_id: customerId, user_id: userId, idempotency_key_id: null}
    });
  }

  public async deleteCustomerById(
    customerId: string
  ): Promise<Partial<PaymentCustomer> | null> {
    return await this.paymentCustomer.delete({
      where: {customer_id: customerId}
    });
  }
}
