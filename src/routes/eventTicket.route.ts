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
import { GetOrderSummary, GetTicketPDF, GetTicketsByEventDto, GetTicketsByIdDto } from '@/dtos/ticket.dto';
import EventTicketController from '@/controllers/eventTicket.controller';
  

class EventTicketRoute implements Routes {
    public path = '/ticket';
    public router = Router();
    public eventTicketController = new EventTicketController();

    public constructor() {
        this.initializeRoutes();
    }
    
    private initializeRoutes(): void {
      // this.router.get(
      //   `${this.path}/event/:id`,
      //   checkAPIVersion,
      //   validationMiddleware(GetTicketsByEventDto, 'params'),
      //   authMiddleware(),
      //   this.mediaController.getTicketByEvent
      // );
      this.router.get(
        `${this.path}/me`,
        checkAPIVersion,
        authMiddleware(),
        this.eventTicketController.getTicketsMe
      );
      this.router.get(
        `${this.path}/me/:orderNumber`,
        checkAPIVersion,
        validationMiddleware(GetTicketPDF, 'params'),
        authMiddleware(),
        this.eventTicketController.getTicketsMeByPurchaseOrder
      );
      this.router.get(
        `${this.path}/me/:orderNumber/pdf`,
        checkAPIVersion,
        validationMiddleware(GetTicketPDF, 'params'),
        authMiddleware(),
        this.eventTicketController.getPDFByOrderPurchase
      );
      this.router.get(
        `${this.path}/:orderNumber/summary`,
        checkAPIVersion,
        validationMiddleware(GetOrderSummary, 'params'),
        authMiddleware(),
        this.eventTicketController.getOrderSummary
      );
      this.router.get(
        `${this.path}/:id`,
        checkAPIVersion,
        authMiddleware(),
        this.eventTicketController.getTicketById
      );
      this.router.get(
        `${this.path}/:id/pdf`,
        checkAPIVersion,
        authMiddleware(),
        this.eventTicketController.getTicketPDF
      );
      
  }
  
}

export default EventTicketRoute;