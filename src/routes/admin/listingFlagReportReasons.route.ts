import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';

class AdminListingFlagReportReasonsRoute implements Routes {
  public path = '/admin/report_reasons';
  public router = Router();

  public constructor() {
    this.initializeRoutes();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private initializeRoutes(): void {}
}

export default AdminListingFlagReportReasonsRoute;
