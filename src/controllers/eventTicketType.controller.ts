import {NextFunction, Request, Response} from 'express';
import { Ticket, TicketType, User} from '@prisma/client';
import {STATUS_CODES, UserRoles} from '@/constants';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { GetAllTickets } from '@/interfaces/tickets.interface';
import { ticketNotFoundException, ticketUnathorizedException } from '@/errors/ticket.error';
import config from '@/config';
import { EventTicketTypeService } from '@/services/eventTicketType.services';
import { TicketPaymentTicketsService } from '@/services/ticketPaymentTicket.service';
import { DateTime } from 'luxon';
import { TICKET_TYPE_STATUS, TICKET_TYPE_STATUS_ID } from '@/constants/ticketTypeStatus';
import { EventsService } from '@/services';
import { eventNotFoundException, ticketNotBelongException } from '@/errors/eventTickets.error';
import { LISTING_STATUS } from '@/constants/listingStatus';
import { invalidEventStatusException, ticketAlreadyBuyedException } from '@/errors/event.error';
import { EventTicketTypeRequest } from '@/interfaces/ticketType.interface';

const EVENTS_PATH = 'Event';
const ENV = config.environment;
const S3_BUCKET = config.aws.s3.bucket;

class EventTicketTypeController {
    
    public ticketType = new EventTicketTypeService();
    public ticketPaymentTicket = new TicketPaymentTicketsService();
    public event = new EventsService();

    public getTicketByEvent = async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const id = Number(req.params.id);
        const tickets: Partial<Ticket>[] = await this.ticketType.findByEventId(id);
  
        res.status(STATUS_CODES.OK).json({data: tickets, message: 'findAll'});
      } catch (error) {
        next(error);
      }
    };

    public getTicketTypeById = async (
      req: RequestWithUser,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const id = Number(req.params.id);
        const user = req.user;
        const ticket: any = await this.ticketType.findById(id);
          
        if (!ticket) {
          res
          .status(STATUS_CODES.NOT_FOUND)
          .json({message: 'ticket not found'});
        } 
        
        if (ticket.buyer_id !== user.id || user.role_id !== UserRoles.ADMIN) {
            throw ticketUnathorizedException("Insufficient Permission");
        }
        ticket.image_url = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${user.id}/${EVENTS_PATH}/${ticket.Ticket_type.event_id}/QR/${ticket.qr_code}`
        
        res.status(STATUS_CODES.OK).json({data: ticket, message: 'findOne'});
      } catch (error) {
        next(error);
      }
    };

    public getTicketTypeAvailableById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
          const id = Number(req.params.id);
          const ticket: any = await this.ticketType.findById(id);
              
          if (!ticket) {
            res
            .status(STATUS_CODES.NOT_FOUND)
            .json({message: 'ticket not found'});
          } 
          // avaible tickets
          const limitDate = DateTime.now().minus({seconds: config.event_tickets.buyTime}).toISO();

          const buyed = await this.ticketPaymentTicket.findTicketTypeAvailability(
            ticket.id,
            limitDate
          );

          if (buyed.length > 0) {
            ticket.available = ticket.quantity_avaible - buyed[0]._sum.quantity;
          } else {
            ticket.available = ticket.quantity_avaible;
          }
          
          // TICKET STATUS
          if (ticket.available <= 0) {
            ticket.status = {
              id: TICKET_TYPE_STATUS_ID.SOLD_OUT,
              status: TICKET_TYPE_STATUS.SOLD_OUT
            }
          } else {
            ticket.status = {
              id: TICKET_TYPE_STATUS_ID.AVAILABLE,
              status: TICKET_TYPE_STATUS.AVAILABLE
            }
          }
        
          res.status(STATUS_CODES.OK).json({data: ticket, message: 'findOne'});
        } catch (error) {
          next(error);
        }
      };

    public getTicketTypeAvailableByEventId = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
      try {
          const id = Number(req.params.id);
          const tickets: any = await this.ticketType.findByEventId(id);
          
          if (!tickets) {
            res
            .status(STATUS_CODES.NOT_FOUND)
            .json({message: 'ticket not found'});
          } 
          // available tickets
          const limitDate = DateTime.now().minus({seconds: config.event_tickets.buyTime}).toISO();

          for (const [index, ticket] of tickets.entries()) {
            const buyed = await this.ticketPaymentTicket.findTicketTypeAvailability(
                ticket.id,
                limitDate
            );
            if (buyed.length > 0) {
              tickets[index].available = ticket.quantity_avaible  - buyed[0]._sum.quantity;
            } else {
              tickets[index].available = ticket.quantity_avaible;
            }

            // TICKET STATUS
            if (tickets[index].available <= 0) {
              tickets[index].status = {
                id: TICKET_TYPE_STATUS_ID.SOLD_OUT,
                status: TICKET_TYPE_STATUS.SOLD_OUT
              }
            } else {
              tickets[index].status = {
                id: TICKET_TYPE_STATUS_ID.AVAILABLE,
                status: TICKET_TYPE_STATUS.AVAILABLE
              }
            }
          }
          
          res.status(STATUS_CODES.OK).json({data: tickets, message: 'findOne'});
      } catch (error) {
          next(error);
      }
    };

    public activateTicketType = async (
      req: RequestWithUser,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
          const id = Number(req.params.id);
          const currentUser: User = req.user;
          
          const ticket: any = await this.ticketType.findById(id);

          if (!ticket) {
            throw ticketNotFoundException('Ticket not found');
          }
          
          if (ticket.event.publisher_id !== currentUser.id ) {
            throw ticketUnathorizedException('Insufficient Permissions');
          }
          
          await this.ticketType.activate(id);
          
          res.status(STATUS_CODES.OK).json({message: 'TicketType is now active'});
      } catch (error) {
          next(error);
      }
    };

    public deactivateTicketType = async (
      req: RequestWithUser,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
          const id = Number(req.params.id);
          const currentUser: User = req.user;
          
          const ticket: any = await this.ticketType.findById(id);

          if (!ticket) {
            throw ticketNotFoundException('Ticket not found');
          }

          if (ticket.event.publisher_id !== currentUser.id ) {
            throw ticketUnathorizedException('Insufficient Permissions');
          }
          
          await this.ticketType.deactivate(id);
          
          res.status(STATUS_CODES.OK).json({message: 'TicketType is now inactive'});
      } catch (error) {
          next(error);
      }
    };

    public updateTicketTypes = async (
      req: RequestWithUser,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
          const id = Number(req.params.id);
          const currentUser: User = req.user;
          const event_id = Number(req.body.event_id);
          const tickets= req.body.tickets;
          
          const event = await this.event.findById(id);
          if (!event) {
            throw eventNotFoundException('Event not found');
          }

          if (event.publisher_id !== currentUser.id ) {
            throw ticketUnathorizedException('Insufficient Permissions');
          }

          if (event.status_id === LISTING_STATUS.INACTIVE) {

          }

          // tickets controls
          if(tickets.length > 0) {
            for (const ticket of tickets)  {
              // check only the updates
              if (ticket.id) {
                // control
                await this.ticketType.findById(ticket.id);
                if (!ticket) {
                  throw ticketNotFoundException('Ticket not found');
                }
                if (ticket.event_id !== id) {
                  throw ticketNotBelongException('Ticket does\' belong to the event');
                }
              }
            }
          }

          const ticket: any = await this.ticketType.findById(id);    
        
          if(tickets.length > 0) {
            for (const ticket of tickets)  {
              let data: Partial<TicketType>= {
                type_id: ticket.type,
                name: ticket.name,
                quantity_avaible: ticket.quantity,
                unit_price: ticket.price,
                max_quantity_order: ticket.maxOrder,
                description: ticket.description,
                valid_for: ticket.valid_for,
                active: ticket.active
              };
              if (event.status_id === LISTING_STATUS.ACTIVE || ticket.id) {
                data = {
                  name: ticket.name,
                  quantity_avaible: ticket.quantity,
                  max_quantity_order: ticket.maxOrder,
                  description: ticket.description,
                  active: ticket.active
                }
              }
              if (ticket.id) {               
                await this.ticketType.updateById(ticket.id, data);
              } else {
                const createData: EventTicketTypeRequest = { 
                  event_id: id,
                  type_id: ticket.type,
                  name: ticket.name,
                  quantity_avaible: ticket.quantity,
                  unit_price: ticket.price,
                  max_quantity_order: ticket.maxOrder,
                  description: ticket.description,
                  valid_for: ticket.valid_for,
                  active: ticket.active
                };
                await this.ticketType.create(createData);
              }
            }
          }
          
          res.status(STATUS_CODES.OK).json({message: 'Tickets updateda'});
      } catch (error) {
          next(error);
      }
    };

    public deleteTicketType = async (
      req: RequestWithUser,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
          const id = Number(req.params.id);
          const currentUser: User = req.user;
          
          const ticketToDelete = await this.ticketType.findById(id);
          if (!ticketToDelete) {
            throw ticketNotFoundException('Ticket not found');
          }
          // event controls
          const event = await this.event.findById(ticketToDelete.event_id);
          if (!event) {
            throw eventNotFoundException('Event not found');
          }

          if (event.publisher_id !== currentUser.id ) {
            throw ticketUnathorizedException('Insufficient Permissions');
          }

          if (event.status_id === LISTING_STATUS.INACTIVE) {
            throw invalidEventStatusException('Can\'t delete Ticket of a Past Event');
          }
         
          if (event.status_id === LISTING_STATUS.ACTIVE) {
            throw invalidEventStatusException('Can\'t delete Ticket of an Active Event');           
          }

          const selledTickets = await this.ticketPaymentTicket.findByTicketTypeId(id)
          if (selledTickets.length > 0) {
            throw ticketAlreadyBuyedException('Can\'t delete Ticket already buyed');
          }

          await this.ticketType.delete(id);
          
          
          res.status(STATUS_CODES.OK).json({message: 'TicketType deleted'});
      } catch (error) {
          next(error);
      }
    };
  }
  

  
  export default EventTicketTypeController;
  