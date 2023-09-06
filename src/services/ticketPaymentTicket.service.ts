import {PaymentCustomer, TicketPayment, TicketPaymentTickets} from '@prisma/client';
import prisma from '@/db';
import {PAYMENT_STATUS} from '@/constants/payments';
import { DateTime } from 'aws-sdk/clients/devicefarm';


class TicketAvailability {

}

export class TicketPaymentTicketsService {
  public paymentCustomer = prisma.paymentCustomer;
  public payment = prisma.ticketPayment;
  public paymentTicketsPayment = prisma.ticketPaymentTickets;
  public ticketType = prisma.ticketType;

  public async findByTicketTypeId(id: number): Promise<Partial<TicketPaymentTickets>[] | null> {
    return await this.paymentTicketsPayment.findMany({
      select: {
        payment_id: true,
        payment: true,
        quantity: true,
        ticket: true,
        ticket_type_id: true,
      },
      where: {ticket_type_id: id}
    });
  }

  public async findByTicketPaymentId(id: string): Promise<Partial<TicketPaymentTickets>[] | null> {
    return await this.paymentTicketsPayment.findMany({
      select: {
        payment_id: true,
        payment: true,
        quantity: true,
        ticket: true,
        ticket_type_id: true,
      },
      where: {payment_id: id},
      orderBy: {
        ticket_type_id: 'asc'
      }
    });
  }

  public async findUniqueByTicketPaymentId(id: string): Promise<Partial<any> | null> {
    return await this.paymentTicketsPayment.findFirst({
      select: {
        payment_id: true,
        payment: true,
        quantity: true,
        ticket: {
          select: {
            id: true,
            name: true,
            Ticket: {select: {id: true, purchase_order_number: true, Buyer:true}}
          }
        },
        ticket_type_id: true,
      },
      where: {payment_id: id}
    });
  }

  public async findTicketTypeAvailability(id: number, limitDate: DateTime): Promise<any> {
    return await this.paymentTicketsPayment.groupBy({
        by: ['ticket_type_id'],
        _sum: {
            quantity: true
        },
        where:{
            ticket_type_id: id,
            payment: {
                OR: [
                  {
                    status: PAYMENT_STATUS.FINISHED
                  },
                  {
                    AND: [
                      {
                        status: PAYMENT_STATUS.PENDING
                      },
                      { 
                        created_at: {
                          gt: limitDate
                        }
                      }
                  ]}
                ]
            }
        }
      })
  }

  private async getTicketTypeIdsForEvent(eventId: number) {
    const ticketTypeIds = await this.ticketType.findMany({
      where: {
        event_id: eventId,
      },
      select: {
        id: true,
      },
    });
    return ticketTypeIds.map((type) => type.id);
  }

  private buildPaymentWhereClause(ticketTypeIds: number[],params?: any,) {
    const where: any = {
      status: "FINISHED",
    };
  
    if (ticketTypeIds.length > 0) {
      where.TicketPaymentTickets = {
        some: {
          ticket: {
            id: {
              in: ticketTypeIds,
            },
          },
        },
      };
    }
  
    if (params) {
      const orConditions: any[] = [];
  
      if (params.search) {
        orConditions.push(
          {
            user: {
              full_name: { contains: params.search, mode: 'insensitive' },
            },
          },
          {
            user: {
              email: { contains: params.search, mode: 'insensitive' },
            },
          },
          {
            TicketPaymentTickets: {
              some: {
                ticket: {
                  name: { contains: params.search, mode: 'insensitive' },
                },
              },
            },
          }
        );
      }
  
      if (orConditions.length > 0) {
        where.OR = orConditions;
      }
    }
  
    return where;
  }

  private buildPaymentQuery(where: any, params?: any) {
    let take = 10

    const select = {
      id: true,
      amount: true,
      service_fee: true,
      user: {
        select: {
          full_name: true,
          email: true,
        },
      },
      TicketPaymentTickets: {
        select: {
          quantity: true,
          ticket_type_id: true,
          ticket: {
            select: {
              name: true,
            },
          },
        },
      },
    };
  
    const query: any = {
      select,
      where,
    };
  
     //cursor
     if (params?.cursor && !params.skip) {
      query['cursor'] = {
        id: Number(params.cursor)
      };
      query['skip'] = 1;
    }

    //skip
    if (params?.skip && !params.cursor) {
      query['skip'] = Number(params.skip);
    }

    if (params.take) {
      take = Number(params.take);
    }

    if (take > 0) {
      query['take'] = take;
    }
    
    let order,
      criteria = 'id';
    if (params?.order) {
      order = params.order;
    }
    if (params?.order_by) {
      criteria = params.order_by;
    }
    query['orderBy'] = {
      [criteria]: order ? order : 'desc'
    };
  
    return query;
  }

  public async findByEventId(eventId: number, params?: any): Promise<Partial<any> | null> {
    const paymentData = {
      payments: [],
      total: 0,
      cursor: 0,
      pages: 0,
    };
  
    // Step 1: Get the TicketType IDs associated with the event.
    const ticketTypeIds = await this.getTicketTypeIdsForEvent(eventId);
  
    // Step 2: Build the 'where' object for the main query.
    const where = this.buildPaymentWhereClause(ticketTypeIds,params);
  
    // Step 3: Build the main query.
    const query = this.buildPaymentQuery(where,params);
  
    // Run the query and get the results.
    paymentData.payments = await this.payment.findMany(query);
    paymentData.total = await this.payment.count({ where });
    paymentData.pages = Math.ceil(Number(paymentData.total / query.take));
  
    const lastResults = paymentData.payments[paymentData.payments.length - 1];
    if (lastResults) {
      paymentData.cursor = lastResults.id;
    }
  
    return paymentData;
  }
  
}
