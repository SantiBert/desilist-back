import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import AttendancesController from '@/controllers/attendance.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import { AttendanceDto,AttendanceLocationDto } from '@/dtos/attendance.dto';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';

class AttendanceRoute implements Routes {
  public path = '/attendance';
  public router = Router();
  public attendancesController = new AttendancesController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}/`,
      checkAPIVersion,
      validationMiddleware(AttendanceLocationDto, 'query'),
      this.attendancesController.getAttendenceLocation
    );
    this.router.get(
      `${this.path}/confirm`,
      checkAPIVersion,
      validationMiddleware(AttendanceDto, 'query'),
      this.attendancesController.getAttendenceCheckAproved
    );
  }
}

export default AttendanceRoute;
