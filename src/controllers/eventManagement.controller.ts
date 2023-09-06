import fs from 'fs';
import { NextFunction, Request, Response } from 'express';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {DateTime} from 'luxon';
import { isSameDate } from '@/utils/time';
import {
  EventsService, 
  TicketService, 
  TicketPaymentService,
  TicketPaymentTicketsService
} from '@/services';
import {STATUS_CODES,UserRoles} from '@/constants';
import { TICKET_STATUS } from '@/constants/ticketStatus';
import { TICKET_TYPE_STATUS } from '@/constants/ticketTypeStatus';
import { 
  eventNotFoundException, 
  eventUnathorizedException} from '@/errors/event.error';
import { getEventStatus } from '@/utils/salesStatus';
import { Parser } from "json2csv"
import { zeroPadding } from '@/utils/math';
class EventManagementController {
    public events = new EventsService();
    public ticket = new TicketService();
    public payment = new TicketPaymentService();
    public ticketPay = new TicketPaymentTicketsService();

    private findPurchaseOrderNumberByPaymentId = (
      paymentId, 
      purChaseOrderNumbers
      ) =>  {
        const matchedGroup = purChaseOrderNumbers.find((group) => group.payment_id === paymentId);

        if (matchedGroup) {
          return matchedGroup.purchase_order_number;
        }
      
        return null
    }

    public getMyEventsData = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
      ) : Promise<void> => {
        try {
            const user = req.user;
            const currentDate = new Date()
            const pastEvents = [];
            const upcomingEvents = [];
            const allEvents = await this.events.findByOrganizer(
              user.id
            )
            for (const event of allEvents) {
              const end_at = new Date(event.end_at);
              const status = await getEventStatus(event);
              let eventData = {
                id:event.id,
                name:event.title,
                status:status,
                start_at:event.start_at,
                end_at:event.end_at,
              }
              if (end_at < currentDate) {
                pastEvents.push(eventData);
              } else {
                upcomingEvents.push(eventData);
              }
              
          }
          let data = {
            past_events:pastEvents,
            upcoming_events:upcomingEvents
          }
          res.status(STATUS_CODES.OK).json({data: data, message: 'findAll'});
        } catch (error) {
          next(error);
        }
      }

    public getAllEventsData = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
      ) : Promise<void> => {
        try {
            const currentDate = new Date()
            const pastEvents = [];
            const upcomingEvents = [];
            const allEvents = await this.events.findByOrganizer()
            for (const event of allEvents) {
              const end_at = new Date(event.end_at);
              const status = await getEventStatus(event)

              let eventData = {
                id:event.id,
                name:event.title,
                status:status,
                start_at:event.start_at,
                end_at:event.end_at,
              }
              if (end_at < currentDate) {
                pastEvents.push(eventData);
              } else {
                upcomingEvents.push(eventData);
              }
              
          }
          let data = {
            past_events:pastEvents,
            upcoming_events:upcomingEvents
          }
          res.status(STATUS_CODES.OK).json({data: data, message: 'findAll'});
        } catch (error) {
          next(error);
        }
      }      

    public getEventSalesSumarry = async (
      req: RequestWithUser,
      res: Response,
    next: NextFunction
    ) : Promise<void> => {
      try {
        const user = req.user;
        const id = Number(req.params.id);
        const params:any = req.query
        const event:any = await this.events.findById(id);
        const ticketTypes = event.Ticket_type;
        let netSalesTotal = 0;
        let attendanceTotal = 0
        let date = null
        let totalByTicketsType = [];
        let ticketsAvailable = 0
        let ticketsSold = 0

        if(params.date){
          date = params.date;
        }

        if (!event) {
          throw eventNotFoundException('Event not found');
        }

        if (event.publisher_id !== user.id &&
          user.role_id !== UserRoles.ADMIN){
            throw eventUnathorizedException('Access denied');
        }
        
        for (const ticketType of ticketTypes) {
          let ticketsAmount = ticketType.Ticket.length;
          let quantityAvaible = ticketType.quantity_avaible;
          let unitPrice = ticketType.unit_price
          const tickets = ticketType.Ticket;
          let attendanceAcont = 0;
          let netSale = (ticketsAmount * (unitPrice / 100))
          netSalesTotal = netSalesTotal + netSale
          ticketsAvailable += quantityAvaible
          ticketsSold += ticketsAmount
          let status
          if (!ticketType.active){
            status = TICKET_TYPE_STATUS.DISABLE
          }else{
            if(ticketsAmount >= quantityAvaible){
              status = TICKET_TYPE_STATUS.SOLD_OUT
            }else{
              status = TICKET_TYPE_STATUS.AVAILABLE
            }
          }

          for (const ticket of tickets) {
            const attendanceTickets = ticket.qr_status.filter(qrStatus => qrStatus.status === TICKET_STATUS.REDEEMED);
            attendanceAcont += attendanceTickets.length;
          }
          attendanceTotal += attendanceAcont
          totalByTicketsType.push({
            "name":ticketType.name,
            "attendance": attendanceAcont,
            "status":status,
            "tickets_total":ticketType.quantity_avaible,
            "tickets_sold":ticketsAmount ,
            "total_earned":netSale.toFixed(2)
          })
        }
       
        let data ={
          net_sales: netSalesTotal,
          tickets_sold:{
            tickets_available:ticketsAvailable,
            tickets_sold:ticketsSold
          },
          attendance:attendanceTotal,
          total_by_tickets_type:totalByTicketsType,
        }
        
        res.status(STATUS_CODES.OK).json({data, message: 'findAll'});
      } catch (error) {
        next(error);
      }
    }

    public getAttendanceOrder = async(
      req: RequestWithUser,
      res: Response,
    next: NextFunction
    ) : Promise<void> => {
      try {
        const user = req.user;
        const id = Number(req.params.id);
        const { qr_code,search, ticket_name, take, check_in_time,fee, skip, order_by} = req.query

        const params = {qr_code, search , ticket_name}

        const event:any = await this.events.findById(id);
        const ticketTypes = event.Ticket_type;
        let ticketsAttendance = [];

        let fromTake = 10;

        let fromSkip = 0;

        if(take){
          fromTake = Number(take);
        }

        if (skip){
          fromSkip = Number(skip);
        }

        if (!event) {
          throw eventNotFoundException('Event not found');
        }

        if (event.publisher_id !== user.id &&
          user.role_id !== UserRoles.ADMIN){
            throw eventUnathorizedException('Access denied');
        }

        for (const ticketType of ticketTypes) {
          const ticketTypeId = ticketType.id
          const tickets = await this.ticket.findByTicketType(ticketTypeId,params);
          for (const [ticketIndex,ticket] of tickets.entries()) {
            const qrStatus = ticket.qr_status;
            if(qrStatus){
              qrStatus.forEach((index) => {
                let status = index["status"];
                let checkInTime = index["redeem"]
                const qrCode = `${ticket.purchase_order_number}#${zeroPadding(ticketIndex + 1,3)}`;
                let attendanceObject = {
                  qr_code:qrCode,
                  //qr_code:ticket.qr_code,
                  user_name:ticket.Buyer.full_name,
                  user_email:ticket.Buyer.email,
                  ticket_type: ticketType.name,
                  ticket_type_id: ticketType.id,
                  status:status,
                  check_in_time:checkInTime
                }
                if (status == TICKET_STATUS.REDEEMED){
                  if(check_in_time || qr_code){
                    if(check_in_time == checkInTime
                      ||qrCode == qr_code ){
                      ticketsAttendance.push(attendanceObject)
                    }
                  }else{
                    ticketsAttendance.push(attendanceObject)
                  }
                }  
              })
            }
          }
          
        }

        const tabAttendance = {
          tickets:ticketsAttendance.slice(fromSkip, fromSkip + fromTake),
          total:ticketsAttendance.length,
          pages:Math.ceil(Number(ticketsAttendance.length / fromTake))
        }

        res.status(STATUS_CODES.OK).json({data:tabAttendance, message: 'findAll'});
      } catch (error) {
        next(error);
      }
    }
    
    public getPurchaseOrder = async(
      req: RequestWithUser,
      res: Response,
    next: NextFunction
    ) : Promise<void> => {
      try {
        const user = req.user;
        const id = Number(req.params.id);

        const params = req.query

        const event:any = await this.events.findById(id);

        if (!event) {
          throw eventNotFoundException('Event not found');
        }

        if (event.publisher_id !== user.id &&
          user.role_id !== UserRoles.ADMIN){
            throw eventUnathorizedException('Access denied');
        }
        
        const purChaseOrderNumbers = await this.ticket.groupByPurchaseOrder(event.id, params);

        const paymentsData = await this.ticketPay.findByEventId(event.id, params);

        const payments = paymentsData.payments

        for (const payment of payments) {
          let tickets = payment.TicketPaymentTickets;
          let totalQuantity = 0;
          let ticketList = [];
          tickets.forEach(ticket => {
            totalQuantity = totalQuantity + ticket.quantity
            ticketList.push({
              ticket_name: ticket.ticket.name,
              quantity: ticket.quantity,
            })
          });
          payment['tickets_quantitity'] = totalQuantity;
          payment['tickets'] = ticketList;
          payment['subTotal'] = payment.amount - payment.service_fee;
          payment['purchase_order_number'] = this.findPurchaseOrderNumberByPaymentId(payment.id, purChaseOrderNumbers);
          payment['total'] = payment.amount;
          payment['user_name'] = payment.user.full_name;
          payment['user_email'] = payment.user.email;
        }

        res.status(STATUS_CODES.OK).json({data:paymentsData, message: 'findAll'});
      } catch (error) {
        next(error);
      }
    }

    public getAttendanceOrderCSV = async(
      req: RequestWithUser,
      res: Response,
    next: NextFunction
    ) : Promise<void> => {
      try {
        const user = req.user;
        const id = Number(req.params.id);
        const { 
          qr_code, 
          user_name, 
          user_email, 
          ticket_name, 
          check_in_time, 
          take, 
          skip, 
          order_by
        } = req.query

        const params = {qr_code,user_name,user_email, ticket_name, take, skip, order_by}

        const event:any = await this.events.findById(id);
        const ticketTypes = event.Ticket_type;
        let tabAttendance = [];

        if (!event) {
          throw eventNotFoundException('Event not found');
        }

        if (event.publisher_id !== user.id &&
          user.role_id !== UserRoles.ADMIN){
            throw eventUnathorizedException('Access denied');
        }

        for (const ticketType of ticketTypes) {
          const ticketTypeId = ticketType.id
          const tickets = await this.ticket.findByTicketType(ticketTypeId,params);
          for (const [ticketIndex, ticket] of tickets.entries()) {
            const qrStatus = ticket.qr_status;
            if(qrStatus){
              qrStatus.forEach((index) => {
                let status = index["status"];
                let checkInTime = index["redeem"]

                const qr_code = `${ticket.purchase_order_number}#${zeroPadding(ticketIndex + 1,3)}`;
                let attendanceObject = {
                  qr_code,
                  user_name:ticket.Buyer.full_name,
                  user_email:ticket.Buyer.email,
                  ticket_type: ticketType.name,
                  ticket_type_id: ticketType.id,
                  status:status,
                  check_in_time:checkInTime
                }
                if (status == 2){
                  if(check_in_time){
                    if(check_in_time == checkInTime){
                      tabAttendance.push(attendanceObject)
                    }
                  }else{
                    tabAttendance.push(attendanceObject)
                  }
                }  
              })
            }
          }
          
        }

        // create CSV
        const dir = './temp';
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        
        const fields = [
          {
            value: 'qr_code',
            label: 'QR Code'
          },
          {
            value: 'purchase_order_number',
            label: 'Purchase Order'
          },
          {
            value: 'tickets_quantitity',
            label: 'Quantity'
          },
          {
            value: 'user_name',
            label: 'User Name'
          },
          {
            value: 'user_email',
            label: 'User Email'
          },
          {
            value: 'ticket_type',
            label: 'Ticket Type'
          },
          {
            value: 'status',
            label: 'Status'
          },
          {
            value: 'check_in_time',
            label: 'Check In Time'
          },
        ];
        const opts = { fields };

        const parser = new Parser(opts);
        const csv = await parser.parse(tabAttendance);

        const file = Buffer.from(csv);
        await fs.writeFileSync(`${dir}/Attendance_Order_Event_${id}.csv`, file);
        const stream = fs.createReadStream(
          `${dir}/Attendance_Order_Event_${id}.csv`
        );
        res.set({
          'Content-Disposition': `attachment; filename='Attendance_Order_Event_${id}.csv'`,
          'Content-Type': 'text/csv'
        });
        stream.pipe(res);
      } catch (error) {
        next(error);
      }
    }

    public getPurchaseOrderCSV = async(
      req: RequestWithUser,
      res: Response,
    next: NextFunction
    ) : Promise<void> => {
      try {
        const user = req.user;
        const id = Number(req.params.id);

        let params = req.query

        let {take} = req.query

        if(!take){
          take = "-1"
        }

        params = {...params,take }

        const event:any = await this.events.findById(id);

        if (!event) {
          throw eventNotFoundException('Event not found');
        }

        if (event.publisher_id !== user.id &&
          user.role_id !== UserRoles.ADMIN){
            throw eventUnathorizedException('Access denied');
        }

        const purChaseOrderNumbers = await this.ticket.groupByPurchaseOrder(event.id, params);

        const paymentsData = await this.ticketPay.findByEventId(event.id,params);

        const payments = paymentsData.payments

        for (const payment of payments) {
          let tickets = payment.TicketPaymentTickets;
          let totalQuantity = 0;
          let ticketList = [];
          tickets.forEach(ticket => {
            totalQuantity = totalQuantity + ticket.quantity
            ticketList.push({
              ticket_name: ticket.ticket.name,
              quantity: ticket.quantity,
            })
          });
          payment['tickets_quantitity'] = totalQuantity;
          payment['tickets'] = ticketList.map(x => `${x.ticket_name} - ${x.quantity}`).join(', ');;
          payment['subTotal'] = payment.amount - payment.service_fee;
          payment['purchase_order_number'] = this.findPurchaseOrderNumberByPaymentId(payment.id, purChaseOrderNumbers);
          payment['total'] = payment.amount;
          payment['user_name'] = payment.user.full_name;
          payment['user_email'] = payment.user.email;
        }
        // create CSV
        const dir = './temp';
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        // const listingsCsv: any = await this.listings.findCsv();
        const fields = [
          {
            value: 'purchase_order_number',
            label: 'Purchase Order'
          },
          {
            value: 'tickets_quantitity',
            label: 'Quantity'
          },
          {
            value: 'user_name',
            label: 'User Name'
          },
          {
            value: 'user_email',
            label: 'User Email'
          },
          {
            value: 'subTotal',
            label: 'Sub Total'
          },
          {
            value: 'service_fee',
            label: 'Service Fee'
          },
          {
            value: 'total',
            label: 'Total'
          },
          {
            value: 'tickets',
            label: 'Ticket Type'
          },
        ];
        const opts = { fields };

        const parser = new Parser(opts);
        const csv = await parser.parse(payments);

        const file = Buffer.from(csv);
        await fs.writeFileSync(`${dir}/Purchase_Order_Event_${id}.csv`, file);
        const stream = fs.createReadStream(
          `${dir}/Purchase_Order_Event_${id}.csv`
        );
        res.set({
          'Content-Disposition': `attachment; filename='Purchase_Order_Event_${id}.csv'`,
          'Content-Type': 'text/csv'
        });
        stream.pipe(res);

        // res.status(STATUS_CODES.OK).json({data:tabPurchaseOrder, message: 'findAll'});
      } catch (error) {
        next(error);
      }
    }
}

export default EventManagementController;