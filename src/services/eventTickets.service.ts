import {Ticket } from '@prisma/client';
import prisma from '@/db';
import { TICKET_STATUS } from '@/constants/ticketStatus';
import { GetAllTickets } from '@/interfaces/tickets.interface';

export class EventTicketService {

    public event_ticket = prisma.ticket;

    public async create(data: any): Promise<Partial<Ticket> | null> {
      return await this.event_ticket.create({
        select: {
          qr_code: true
        }, data,
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
          Ticket_type: true,
          buyer_id: true,
          purchase_order_number: true,
          qr_status: true,

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

      ticketData.tickets =  await this.event_ticket.findMany(query);
      //total results
      ticketData.total = await this.event_ticket.count({where: where});
      //total pages
      ticketData.pages = Math.ceil(Number(ticketData.total / take));
      //update lastCursor
      const lastResults = ticketData.tickets[ticketData.tickets.length - 1];
      if (lastResults) {
        ticketData.cursor = lastResults.id;
      }
      return ticketData;
    }

    public async findByEvent(eventId: number): Promise<Partial<Ticket>[] | null> {
      return await this.event_ticket.findMany({
        where:{
          Ticket_type: {
            event_id: eventId
          }
        }
      }
      )
    }

    public async findByPurchaseOrderNumber(id: string): Promise<Partial<any>[] | null> {
      return await this.event_ticket.findMany({
        select: {
          id:true,
          qr_code: true,
          ticket_type_id: true,
          Ticket_type: true,
          Buyer: true,
          buyer_id: true,
          purchase_order_number: true,
          payment_id: true,
          payment: true,
          qr_status: true,
        },
        where: {
          purchase_order_number: id
        },
        orderBy: {
          ticket_type_id: 'asc',
        }
      });
  }

    public async findById(id: number): Promise<Partial<Ticket> | null> {
      return await this.event_ticket.findUnique({
        where: {id},
        include: {
          Ticket_type: true
        }
      });
    }
    
    public async updateById(
      id: number,
      data: Ticket
    ): Promise<Partial<Ticket> | null> {
      return await this.event_ticket.update({
        select: {id: true},
        data: {...data},
        where: {id}
      });
    }
    
    public async delete(id: number): Promise<Partial<Ticket> | null>  {
      return await this.event_ticket.delete({
        where: {id}
      });
    }

    public async findByQrCode(qrCode: any): Promise<Partial<Ticket> | null> {
      return await this.event_ticket.findFirst({
        select: {
          id:true,
          qr_code:true,
          qr_status: true,
          buyer_id:true,
          purchase_order_number:true,
          Ticket_type:{
            select:{
              event_id:true,
              type_id:true,
              name:true,
              quantity_avaible:true,
              unit_price:true,
              max_quantity_order:true,
              description:true,
              valid_for:true
            }
          },
          Buyer:{
            select:{
              id:true,
              full_name:true,
              email:true
            }
          }
        },
        where: { qr_code: qrCode },
      });
    }
    public async updateByDateTicketId(
      ticketId: number,
      position: number,
      newDate: Date,

    ): Promise<Partial<Ticket> | null> {
      const ticket = await this.event_ticket.findUnique({
        where: {id: ticketId}
      });

      const validFor =  ticket.qr_status[position]["valid_for"]

      const newData:any = {
        valid_for: validFor,
        status: TICKET_STATUS.REDEEMED,
        redeem: newDate
      }
      ticket.qr_status[position] = newData;

      return await this.event_ticket.update({
        where: { id: ticketId },
        data: { qr_status: ticket.qr_status },
      });
    }
}