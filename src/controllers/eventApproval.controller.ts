import {NextFunction, Request, Response} from 'express';
import {STATUS_CODES} from '@/constants';
import {EventsService} from '@/services/events.service';
import { EventApprovalService } from '@/services/eventApproval.service';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { eventNotFoundException } from '@/errors/eventTickets.error';
import { eventUnathorizedException } from '@/errors/event.error';

class EventApprovalController {
  public EventApproval = new EventApprovalService();
  public events = new EventsService();

  public getReportByEventId = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const currentUser = req.user;
      const eventReports = await this.EventApproval.getReportByEventId(id);

      const eventReported: any = await this.events.findById(id);
      if (!eventReported) {
        throw eventNotFoundException('Event not found');
      }

      if (eventReported.publisher.id !== currentUser.id) {
        throw eventUnathorizedException('Insufficient Permissions');
      }
      
      res.status(STATUS_CODES.OK).json({
        data: eventReports,
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };

  public getDeniedReasons = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const deniedReasons = await this.EventApproval.getDeniedReasons();

      res.status(STATUS_CODES.OK).json({
        data: deniedReasons,
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };
}

export default EventApprovalController;
