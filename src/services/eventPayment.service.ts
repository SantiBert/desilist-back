import {PaymentCustomer, Payment, EventPayment} from '@prisma/client';
import prisma from '@/db';
import {PAYMENT_STATUS} from '@/constants/payments';

export class EventPaymentService {
  public paymentCustomer = prisma.paymentCustomer;
  public payment = prisma.eventPayment;

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
      data: {customer_id: customerId, user_id: userId, idempotency_key_id: 1}
    });
  }

  public async find(id: string): Promise<Partial<EventPayment> | null> {
    return await this.payment.findUnique({
      select: {
        user_id: true,
        amount: true,
        event_id: true,
        promote_package_id: true,
        status: true,
      },
      where: {id}
    });
  }

  public async findByUserId(userId: string): Promise<Partial<EventPayment>[]> {
    return await this.payment.findMany({
      select: {
        id: true,
        amount: true,
        event_id: true,
        promote_package: {
          select: {
            name: true
          }
        },
        status: true,
        created_at: true
      },
      where: {user_id: userId},
      orderBy: {created_at: 'desc'},
      take: 30
    });
  }

  public async findFinishedByUserId(
    userId: string,
    params: any
  ): Promise<Partial<any>> {
    const paymentsData = {
      payments: [],
      total: 0
    };
    const where = {
      user_id: userId,
      status: PAYMENT_STATUS.FINISHED,
      listing: {deleted_at: null}
    };

    const take = params.take ? Number(params.take) : 30;
    const skip = params.skip ? Number(params.skip) : 0;

    paymentsData.payments = await this.payment.findMany({
      select: {
        id: true,
        amount: true,
        event_id: true,
        event: {select: {deleted_at: true}},
        promote_package: {select: {name: true}},
        status: true,
        created_at: true,
      },
      where,
      orderBy: {created_at: 'desc'},
      take,
      skip
    });
    paymentsData.total = await this.payment.count({
      where
    });

    return paymentsData;
  }

  public async create(data: EventPayment): Promise<Partial<EventPayment> | null> {
    return await this.payment.create({
      select: {
        id: true,
        amount: true
      },
      data: {...data, status: PAYMENT_STATUS.PENDING}
    });
  }

  public async update(
    id: string,
    status: PAYMENT_STATUS
  ): Promise<Partial<EventPayment> | null> {
    return await this.payment.update({
      select: {id: true},
      data: {status: status},
      where: {id}
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
