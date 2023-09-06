import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import ListingsController from '@/controllers/admin/listings.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import {
  GetAllListingsDto,
  CreateListingDto,
  UpdateListingDto,
  PauseListingDto,
  UnpauseListingDto,
  HighlightListingDto,
  CancelHighlightListingDto,
  PromoteListingDto,
  UnflagListingDto
} from '@/dtos/listings.dto';
import { FlagEventDto, PauseEventDto } from '@/dtos/events.dto';
import aclMiddleware from '@/middlewares/acl.middleware';
import {UserRoles} from '@/constants/user.constants';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import EventsController from '@/controllers/admin/events.controller';
import EventManagementController from '@/controllers/eventManagement.controller';
import { CancelHighlightEventDto, DenyEventDto, GetAllEventsDto, HighlightEventDto, ReproveEventDto } from '@/dtos/events.dto';

class AdminEventsRoute implements Routes {
  public path = '/admin/event';
  public router = Router();
  public eventsController = new EventsController();
  public eventManagementController = new EventManagementController()

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(GetAllEventsDto, 'params'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventsController.getEvents
    );
    this.router.get(
      `${this.path}/:id`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventsController.getEventById
    );
    this.router.post(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(CreateListingDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventsController.createListing
    );
    this.router.patch(
      `${this.path}/:id`,
      checkAPIVersion,
      validationMiddleware(UpdateListingDto, 'body', true),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventsController.updateListing
    );
    this.router.delete(
      `${this.path}/:id`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventsController.deleteListing
    );
    this.router.patch(
      `${this.path}/:id/pause`,
      checkAPIVersion,
      validationMiddleware(PauseEventDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventsController.pauseEvent
    );
    this.router.patch(
      `${this.path}/:id/unpause`,
      checkAPIVersion,
      validationMiddleware(UnpauseListingDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventsController.unpauseListing
    );
    this.router.patch(
      `${this.path}/:id/highlight`,
      checkAPIVersion,
      validationMiddleware(HighlightEventDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventsController.highlightEvent
    );
    this.router.patch(
      `${this.path}/:id/cancel_highlight`,
      checkAPIVersion,
      validationMiddleware(CancelHighlightEventDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventsController.cancelHighlightEvent
    );
    this.router.patch(
      `${this.path}/:id/promote`,
      checkAPIVersion,
      validationMiddleware(PromoteListingDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventsController.promoteEvent
    );
    this.router.patch(
      `${this.path}/:id/approve`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventsController.approveEvent
    );
    this.router.patch(
      `${this.path}/:id/reprove`,
      checkAPIVersion,
      validationMiddleware(ReproveEventDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventsController.reproveEvent
    );
    this.router.patch(
      `${this.path}/:id/deny`,
      checkAPIVersion,
      validationMiddleware(DenyEventDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventsController.denyEvent
    );   
    this.router.patch(
      `${this.path}/:id/flag`,
      checkAPIVersion,
      validationMiddleware(FlagEventDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventsController.flagEvent
    );
    this.router.patch(
      `${this.path}/:id/unflag`,
      checkAPIVersion,
      validationMiddleware(UnflagListingDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.eventsController.unflagEvent
    );
  }
}

export default AdminEventsRoute;
