import {NextFunction, Request, Response} from 'express';
import {STATUS_CODES} from '@/constants';
import {EventsService} from '@/services/events.service';
import { EventApprovalService } from '@/services/admin/eventApproval.service';

class AdminEventApprovalController {
  public EventApproval = new EventApprovalService();
  public getAllPendingEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params = req.query;
      const eventPending = await this.EventApproval.getAllEventPending(
        params
      );

      const {events, total, cursor, pages} = eventPending;

      res.status(STATUS_CODES.OK).json({
        data: {events, total, cursor, pages},
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };

  public getReportByListingId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const listingsReports = await this.EventApproval.getReportByEventId(id);

      res.status(STATUS_CODES.OK).json({
        data: listingsReports,
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

  public newChanges = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const eventReports = await this.EventApproval.getReportByEventId(id);

      res.status(STATUS_CODES.OK).json({
        data: eventReports,
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };

  public seenNewChanges = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const listingsReports = await this.EventApproval.getReportByEventId(id);

      res.status(STATUS_CODES.OK).json({
        data: listingsReports,
        message: 'updatedAll'
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminEventApprovalController;
