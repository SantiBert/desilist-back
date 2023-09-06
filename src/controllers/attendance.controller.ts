import { NextFunction, Request, Response } from 'express';
import { STATUS_CODES } from '@/constants';
import config from '@/config';
import { eventNotFoundException, eventInvalidDateException } from '@/errors/eventTickets.error';
import { getDistance } from '@utils/distances';
import { UserRoles } from '@/constants/user.constants';
import {NOTIFICATION_TYPE} from '@/constants/notifications';
import {
  EventsService,
  EventLocationService,
  EventTicketService
} from '@/services';
import {NotificationService} from '@/services/notification.service';
import notifications from '@/notifications';

import { isSameDate, parseISOToTimeZone } from '@/utils/time';
import {DateTime} from 'luxon';

const S3_BUCKET = config.aws.s3.bucket;
const ENV = config.environment;
const EVENTS_PATH = 'Event';
interface DataItem {
  redeem: string | null;
  status: number;
  valid_for: string;
}
class AttendancesController {
  public event = new EventsService();
  public event_location = new EventLocationService();
  public ticket = new EventTicketService();
  private notification = new NotificationService();

  private findLastRedeemedItem = async (qrStatuList: DataItem[]): Promise< { 
    lastRedeemedItem: string | null; 
    nextAvailableItem: DataItem | null; 
    nextAvailableIndex: number | null;
  }> => {
    let lastRedeemedItem: string | null = null;
    let nextAvailableItem: DataItem | null = null;

    for (const [index,qrStatus] of qrStatuList.entries()) {
      let isTodayvalidFor = isSameDate(qrStatus.valid_for)

      if (qrStatus.redeem !== null) {
        lastRedeemedItem = qrStatus.redeem;
      }
  
      if (isTodayvalidFor) {
        nextAvailableItem = qrStatus;
      }
    }
   
    return { lastRedeemedItem, nextAvailableItem, nextAvailableIndex: nextAvailableItem !== null ? qrStatuList.indexOf(nextAvailableItem) : null };
  };

  public getAttendenceLocation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const qr_code = req.query.qr_code;
      const lat = Number(req.query.lat);
      const lng = Number(req.query.lng);
      const date = new Date();
      const main_location = {
        "lat": lat,
        "lng": lng
      }
      

      const ticket: any = await this.ticket.findByQrCode(qr_code);
      const event_id = ticket.Ticket_type.event_id
      const event:any = await this.event.findById(event_id)

      if (!event) {
        throw eventNotFoundException('Event not found')
      }

      const event_location = await this.event_location.findByEventLatAndLogId(event_id);

      let dateAproved = false;
      const hours:any = config.attendance.timeDefece;

      const start_at_earlier = event.start_at;
      start_at_earlier.setHours(start_at_earlier.getHours() - hours);

      if (
        date >= start_at_earlier &&
        date <= event.end_at
      ) {
        dateAproved = true;
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'invalid date' });
      }

      const distance = await getDistance(main_location, event_location.geometry_point)

      if (dateAproved && distance) {
        const qrStatus = ticket.qr_status
        const { lastRedeemedItem } = await this.findLastRedeemedItem(qrStatus);

        let image = 'https://desilist-1.s3.us-east-2.amazonaws.com/Assets/Website/ListingPlaceHolderChico.PNG';
        if (event.has_banner) {
          image = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${event.publisher_id}/${EVENTS_PATH}/${event.id}/banner`;
        }

        let data = {
          event:{
            event_id: event.id,
            event_name: event.title,
            has_banner:event.has_banner,
            publisher_id:event.publisher_id,
            image:image,
            timezone:event.timezone
          },
          ticker_qr_code: ticket.qr_code,
          ticket_buyer: ticket.Buyer.full_name,
          ticket_purchase_order_number: ticket.purchase_order_number,
          ticket_name: ticket.Ticket_type.name,
          valid_for: ticket.Ticket_type.valid_for,
          last_date_redeem: lastRedeemedItem
        }

        res.status(STATUS_CODES.OK).json({ attendace: true, data: data, message: 'Attendance approved' });
      } else {
        res.status(STATUS_CODES.OK).json({ attendace: false, message: 'Attendance not approved' });
      }
    } catch (error) {
      next(error);
    }
  };

  public getAttendenceCheckAproved = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const qrCode = req.query.qr_code;
      const ticketData: any = await this.ticket.findByQrCode(qrCode);
      const qrStatus = ticketData.qr_status;
      const currentDate = DateTime.now();

      const notification: any = {
        user_id: ticketData.buyer_id,
        scope: UserRoles.USER,
        type: NOTIFICATION_TYPE.TICKET_REDEEMED,
        seen: false,
        title: "Your ticket QR code has been scanned.",
        message: "Ticket QR code scanned.",
        data: {date: currentDate}
      };

      const {  nextAvailableItem, nextAvailableIndex } = await this.findLastRedeemedItem(qrStatus);

      if (!nextAvailableItem){
        throw eventInvalidDateException('Invalid Date')
      }

      let currentPosition = nextAvailableIndex
      let data = {
        ticket_purchase_order_number: ticketData.purchase_order_number,
        ticket_name: ticketData.Ticket_type.name,
        time_checked: currentDate
      }
      if(nextAvailableItem.status !== 2){
        let response = await this.ticket.updateByDateTicketId(
          ticketData.id,
          currentPosition,
          currentDate
        );
        
        if (response){
          await this.notification.create(notification as any);
          notifications.ticketRedeemed(notification)
        }
        
      }
      res.status(STATUS_CODES.OK).json({ data, message: 'Attendance checked' })

    } catch (error) {
      next(error);
    }
  }
}

export default AttendancesController