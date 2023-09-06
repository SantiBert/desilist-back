import {TicketType} from '@prisma/client';
import prisma from '@/db';
import { EventTicketTypeRequest } from '@/interfaces/ticketType.interface';

export class EventTicketTypeService {

    public event_ticket_type = prisma.ticketType;

    public async create(data: EventTicketTypeRequest): Promise<Partial<TicketType> | null> {
      return await this.event_ticket_type.create({
        select: {
          id: true
        }, data,
      });
    }

    public async findByEventId(id: number): Promise<Partial<TicketType>[] | null> {
        return await this.event_ticket_type.findMany({
          where: {
              event_id: id
          },
          include: {
            event: true
          }
           
        });
    }

    public async findById(id: number): Promise<Partial<TicketType> | null> {
      return await this.event_ticket_type.findUnique({
        where: {id},
        include: {
          event: true
        }
      });
    }
    
    public async updateById(
      id: number,
      data: Partial<EventTicketTypeRequest>
    ): Promise<Partial<TicketType> | null> {
      return await this.event_ticket_type.update({
        select: {id: true},
        data: {...data},
        where: {id}
      });
    }
    
    public async delete(id: number): Promise<Partial<TicketType> | null>  {
      return await this.event_ticket_type.delete({
        where: {id}
      });
    }

    public async activate(id: number): Promise<Partial<TicketType> | null> {
      return await this.event_ticket_type.update({
        data: {
          active: true
        },
        where: {id}
      });
    }

    public async deactivate(id: number): Promise<Partial<TicketType> | null> {
      return await this.event_ticket_type.update({
        data: {
          active: false
        },
        where: {id}
      });
    }

}