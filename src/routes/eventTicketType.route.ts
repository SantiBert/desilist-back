import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import {checkAPIVersion, } from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import aclMiddleware from '@/middlewares/acl.middleware';

import {UserRoles} from '../constants/user.constants';

import {
    GetMediaDto,
  } from '@/dtos/media.dto';
import { GetTicketsByEventDto, GetTicketsByIdDto } from '@/dtos/ticket.dto';
import EventTicketTypeController from '@/controllers/eventTicketType.controller';
  

class EventTicketTypeRoute implements Routes {
    public path = '/ticket';
    public router = Router();
    public eventTicketController = new EventTicketTypeController();

    public constructor() {
        this.initializeRoutes();
    }
    
    private initializeRoutes(): void {
      this.router.get(
        `${this.path}/event/:id/available`,
        checkAPIVersion,
        // authMiddleware(),
        this.eventTicketController.getTicketTypeAvailableByEventId
      );
      this.router.get(
        `${this.path}/:id/available`,
        checkAPIVersion,
        // authMiddleware(),
        this.eventTicketController.getTicketTypeAvailableById
      );
      this.router.patch(
        `${this.path}/:id/activate`,
        checkAPIVersion,
        authMiddleware(),
        this.eventTicketController.activateTicketType
      );
      this.router.patch(
        `${this.path}/:id/deactivate`,
        checkAPIVersion,
        authMiddleware(),
        this.eventTicketController.deactivateTicketType
      );
      this.router.patch(
        `${this.path}/:id`,
        checkAPIVersion,
        authMiddleware(),
        this.eventTicketController.updateTicketTypes
      )
      this.router.delete(
        `${this.path}/:id`,
        checkAPIVersion,
        authMiddleware(),
        this.eventTicketController.deleteTicketType
      )
  }
  
}

export default EventTicketTypeRoute;