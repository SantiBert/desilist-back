import {Router} from 'express';
import ListingFlagReportReasonsController from '@/controllers/listingFlagReportReasons.controller';
import {Routes} from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import {UserRoles} from '@/constants/user.constants';
import authMiddleware from '@/middlewares/auth.middleware';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import aclMiddleware from '@/middlewares/acl.middleware';
import {GetReportReasons} from '@/dtos/listingFlagReportReasons.dto';

class ListingFlagReportReasonsRoute implements Routes {
  public path = '/report_reasons';
  public router = Router();
  public listingFlagReportReasonController =
    new ListingFlagReportReasonsController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(GetReportReasons, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.USER),
      this.listingFlagReportReasonController.getFlagReasons
    );
  }
}

export default ListingFlagReportReasonsRoute;
