import {Ticket} from '@prisma/client';
import prisma from '@/db';
import { GetAllTickets } from '@/interfaces/tickets.interface';

export class TicketService {
    public ticket = prisma.ticket;

    public async findByEvent(eventId: number): Promise<Partial<Ticket>[] | null> {
      return await this.ticket.findMany({
        where:{
          Ticket_type: {
            event_id: eventId
          },
          payment: {
            status: "FINISHED"
          }
        }
      }
      )
    }

  public async findByTicketType(ticketId: number, params?: any): Promise<Partial<any>[] | null> {

    let take = 0

    let where: any  = {
      Ticket_type: {
        id: ticketId
      },
      payment: {
        status: "FINISHED"
      }
    }
    if (params) {
      let orConditions = [];
      /*
      if (params.qr_code) {
        orConditions.push({ qr_code: params.qr_code });
      }*/
      if (params.purchase_order) {
        orConditions.push({ purchase_order_number: params.purchase_order });
      }

      if (params.search) {
        orConditions.push(
          {
            Buyer: {
              full_name: { contains: params.search, mode: 'insensitive' },
            },
          },
          {
            Buyer: {
              email: { contains: params.search, mode: 'insensitive' },
            },
          },
          {
            Ticket_type: {
              name: { contains: params.search, mode: 'insensitive' },
            },
          }
        );
      }

      if (orConditions.length > 0) {
        where.OR = orConditions;
      }

      if (params.total) {
        where['payment']['amount'] = params.total
      }
      if (params.fee) {
        where['payment']['service_fee'] = params.fee
      }

      
    }

    const select = {
      id: true,
      qr_code: true,
      qr_status: true,
      buyer_id: true,
      purchase_order_number: true,
      payment_id: true,
      payment: true,
      Buyer: {
        select: {
          id: true,
          full_name: true,
          email: true,
        }
      }
    }

    //take
    if (params?.take) {
      take = Number(params.take);
    } else {
      take = 10
    }

    //query
    const query = {
      select: select
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
    if (where) {
      query['where'] = where;
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

    let ticketData = await this.ticket.findMany(query)

    return ticketData
  }

    public async findByTicketTypeCount(ticketId: number): Promise<Partial<number> | null> {
      return await this.ticket.count({
        where:{
          Ticket_type: {
            id: ticketId
          },
          payment: {
            status: "FINISHED"
          }
        }
      }
      )
    }

    public async findByPaymentId(paymentId: string): Promise<Partial<Ticket> | null> {
      return await this.ticket.findFirst({
        select: {
          id:true,
          buyer_id:true,
          ticket_type_id: true,
        },
        where:{
          payment_id:paymentId
        }
      }
      )
    }

    public async findAllByPaymentId(paymentId: string): Promise<Partial<Ticket>[] | null> {
      return await this.ticket.findMany({
        select: {
          id:true,
          buyer_id:true,
          ticket_type_id: true,
          Ticket_type:{
            select:{
              name:true,
              quantity_avaible:true,
              unit_price:true,
              max_quantity_order:true,
              active:true,
              event_id:true
            }
          }
        },
        where:{
          payment_id:paymentId
        }
      }
      )
    }

    public async findById(id: number): Promise<any | null> {
      return await  this.ticket.findFirst({
        select: {
          id:true,
          qr_code: true,
          ticket_type_id: true,
          Ticket_type:{
            select: {
              event_id: true
            }
          },
          buyer_id: true,
          purchase_order_number: true,
        },
        where: {
          id
        }
      });
    }

    public async findByUser(userId: string, params: any): Promise<GetAllTickets | null> {
      
      const ticketData: GetAllTickets = {
        tickets: [],
        total: 0,
        cursor: 0,
        pages: 0
      }
      let take = 10;
      const where = {
        buyer_id: userId,
      };
      //params
      if (params) {
        if (params.ticket_type) {
          where['ticket_type_id'] = params.ticket_type;
        }
        if (params.purchase_oder_number) {
          where['purchase_oder_number'] = params.purchase_oder_number;
        }
        if (params.event_id) {
          where['Ticket_type'] = {
            event_id: params.event_id
          };
        }
        if (params?.take) {
          take = Number(params.take);
        }
      }    
     
      // build query
      const query = {
        select: {
          id:true,
          qr_code: true,
          ticket_type_id: true,
          Ticket_type:{
            select: {
              event_id: true
            }
          },
          buyer_id: true,
          purchase_order_number: true,

        },
        where
      }
      if (take > 0) {
        query['take'] = take;
      }
      // order
      let order,
        criteria = 'id';
      if (params?.order) {
        order = params.order;
      }
      if (params?.order_by) {
        criteria = params.order_by;
      }
      // checks if order is an Array
      if (params?.order_by && params?.order_by.split(',').length > 1) {
        const orderValues = params.order_by.split(',').map((value) => {
          const order = value.includes('!') ? 'asc' : 'desc';
          const parsedValue = value.includes('!')
            ? value.replace('!', '')
            : value;
          return {[parsedValue]: order};
        });
        query['orderBy'] = orderValues;
      } else {
        query['orderBy'] = {
          [criteria]: order ? order : 'desc'
        };
      }

      ticketData.tickets =  await this.ticket.findMany(query);
      //total results
      ticketData.total = await this.ticket.count({where: where});
      //total pages
      ticketData.pages = Math.ceil(Number(ticketData.total / take));
      //update lastCursor
      const lastResults = ticketData.tickets[ticketData.tickets.length - 1];
      if (lastResults) {
        ticketData.cursor = lastResults.id;
      }
      return ticketData;
    }

    public async findByQrCode(qrCode: any): Promise<Partial<Ticket> | null> {
        return await this.ticket.findFirst({
          select: {
            qr_status: true
          },
          where: { qr_code: qrCode },
        });
    }

    public async groupByPurchaseOrder(event_id:number, params?: any):Promise<any>{

      const by:any = ['purchase_order_number', 'payment_id']

      let where:any = {
        Ticket_type:{
          event_id: event_id
        },
        payment:{
          status: "FINISHED"
        }
      }
      
      if(params.purchase_order){
        where = {
          Ticket_type:{
            event_id: event_id
          },
          payment:{
            status: "FINISHED"
          },
          purchase_order_number:params.purchase_order
        }
      }

      const result = await this.ticket.groupBy({
        by,
        where
      });

      return result
    }
}