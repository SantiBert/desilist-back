import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import EventsController from '@/controllers/events.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import {
  GetAllEventsDto,
  GetEventsMeDto,
  GetAllEventsAndListingDto,
  CreateEventsDto,
  UpdateEventDto,
  PublishEventDto,
  DeleteEventDto,
  ReportEventDto,
  PromoteEventDto,
  DuplicateEventDto
} from '@/dtos/events.dto';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import aclMiddleware from '@/middlewares/acl.middleware';
import {UserRoles} from '@/constants';

class EventsRoute implements Routes {
  public path = '/event';
  public router = Router();
  public eventController = new EventsController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(GetAllEventsDto, 'params'),
      this.eventController.getEvents
    );
    this.router.get(
      `${this.path}/me`,
      checkAPIVersion,
      validationMiddleware(GetEventsMeDto, 'params'),
      authMiddleware(),
      this.eventController.getEventsMe
    );
    this.router.get(
      `${this.path}/tickets-avaliable`,
      checkAPIVersion,
      validationMiddleware(GetAllEventsDto, 'params'),
      this.eventController.getEventWhitAvaliableTickets,
    );
    this.router.get(
      `${this.path}/events-and-listing`,
      checkAPIVersion,
      validationMiddleware(GetAllEventsAndListingDto, 'params'),
      this.eventController.getEventsAndListing,
    );
    this.router.get(
      `${this.path}/:id`,
      checkAPIVersion,
      authMiddleware(true),
      this.eventController.getEventById
    );
    this.router.post(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(CreateEventsDto, 'body'),
      authMiddleware(),
      this.eventController.createEvent
    );
    this.router.patch(
      `${this.path}/:id`,
      checkAPIVersion,
      validationMiddleware(UpdateEventDto, 'body'),
      authMiddleware(),
      this.eventController.updateEvent
    );
    this.router.patch(
      `${this.path}/:id/approve`,
      checkAPIVersion,
      validationMiddleware(UpdateEventDto, 'body'),
      authMiddleware(),
      this.eventController.updatePendingEvent
    );
    this.router.delete(
      `${this.path}/:id`,
      checkAPIVersion,
      validationMiddleware(DeleteEventDto, 'body'),
      authMiddleware(),
      this.eventController.deleteEvent
    );
    this.router.patch(
      `${this.path}/:id/publish`,
      checkAPIVersion,
      validationMiddleware(PublishEventDto, 'body'),
      authMiddleware(),
      this.eventController.publishEvent
    );
    this.router.patch(
      `${this.path}/:id/promote`,
      checkAPIVersion,
      authMiddleware(),
      validationMiddleware(PromoteEventDto, 'body'),
      this.eventController.promoteEvent
    );
    this.router.patch(
      `${this.path}/:id/report`,
      checkAPIVersion,
      validationMiddleware(ReportEventDto, 'body'),
      authMiddleware(),
      this.eventController.reportEvent
    );
    this.router.get(
      `${this.path}/:id/report`,
      checkAPIVersion,
      authMiddleware(true),
      this.eventController.isReportedEvent
    );
    this.router.get(
      `${this.path}/:id/share`,
      checkAPIVersion,
      authMiddleware(true),
      this.eventController.shareEventById
    );
    this.router.post(
      `${this.path}/:id/duplicate`,
      checkAPIVersion,
      authMiddleware(true),
      // validationMiddleware(DuplicateEventDto, 'query'),
      this.eventController.duplicateEvent
    );
  }
}

export default EventsRoute;
