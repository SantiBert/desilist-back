import { isPastDate } from "./time";
import {EventsService, TicketService} from '@/services';
import { EVENT_MANAGEMENT_TYPE } from '@/constants/eventStatus';

export const getEventStatus = async (event:any): Promise<any>  => {
    try {
        const ticket = new TicketService();
        const ticketTypes = event.Ticket_type;
        let expierationDate = event.end_at;
        if (event.ticket_close_time){
            expierationDate =event.ticket_close_time;
        }
        const dateIsValid = isPastDate(expierationDate);
        const hasTicket = event.has_ticket;
        let totalTickets = 0;
        let totalQuantityAlivable = 0;

        let status = null
        for (const ticketType of ticketTypes) {
            const tickets = await ticket.findByTicketTypeCount(ticketType.id);
            totalTickets = totalTickets + tickets
            totalQuantityAlivable = totalQuantityAlivable + ticketType.quantity_avaible
        }
   
        if(event.LiveStreaming.length > 0 && !hasTicket){
            status = EVENT_MANAGEMENT_TYPE.STREAMING
        }else{
            if(dateIsValid ){
                status = EVENT_MANAGEMENT_TYPE.SALES_ENDED
            }else{
                if(totalTickets >= totalQuantityAlivable){
                    status = EVENT_MANAGEMENT_TYPE.SOLD_OUT
                }else{
                    status = EVENT_MANAGEMENT_TYPE.TICKETS_AVAILABLE
                }
            }
        }
      return status
    } catch (error) {
      throw new Error('Status cannot be determined');
    }
  }