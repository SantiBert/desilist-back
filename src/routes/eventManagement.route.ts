import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import EventManagementController from '@/controllers/eventManagement.controller';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { 
  EventOrganizerDto,
  AttendanceEventDto,
  PurchaseEventDto
 } from '@/dtos/events.dto';

class EventManagement implements Routes {
    public path = '/events/management';
    public router = Router();
    public eventManagementController = new EventManagementController();

    public constructor() {
        this.initializeRoutes();
    }
    
    private initializeRoutes(): void {
      this.router.get(`${this.path}/my-events`,
        checkAPIVersion,
        authMiddleware(),
        this.eventManagementController.getMyEventsData
      );
      this.router.get(`${this.path}/:id`,
        checkAPIVersion,
        authMiddleware(),
        this.eventManagementController.getEventSalesSumarry
      );
      this.router.get(`${this.path}/:id/attendance`,
        checkAPIVersion,
        validationMiddleware(AttendanceEventDto, 'params'),
        authMiddleware(),
        this.eventManagementController.getAttendanceOrder
      );
      this.router.get(`${this.path}/:id/purchase`,
        checkAPIVersion,
        validationMiddleware(PurchaseEventDto, 'params'),
        authMiddleware(),
        this.eventManagementController.getPurchaseOrder
      );
      this.router.get(`${this.path}/:id/attendance/csv`,
        checkAPIVersion,
        validationMiddleware(AttendanceEventDto, 'params'),
        authMiddleware(),
        this.eventManagementController.getAttendanceOrderCSV
      );
      this.router.get(`${this.path}/:id/purchase/csv`,
        checkAPIVersion,
        validationMiddleware(PurchaseEventDto, 'params'),
        authMiddleware(),
        this.eventManagementController.getPurchaseOrderCSV
      );
  }
  
}

export default EventManagement;