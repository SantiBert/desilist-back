import {NextFunction, Request, Response} from 'express';
import {STATUS_CODES} from '@/constants';
import {AdminDashboardService} from '@/services/admin/dashboard.service';
import AdminListingsRoute from '@/routes/admin/listings.route';
import { ListingService } from '@/services/admin/listings.service';
import { AdminEventsService } from '@/services/admin/events.service';

// this could be an .env var
const MAX_HIGHLIGHTED_ITEMS = 4
class AdminDashboardController {
  public dashboard = new AdminDashboardService();
  public listings =  new ListingService();
  public events = new AdminEventsService();

  public getDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categories = await this.dashboard.findCategories();
      const user = await this.dashboard.countUsers();

      res.status(STATUS_CODES.OK).json({
        data: {categories, user},
        message: 'Dashboard'
      });
    } catch (error) {
      next(error);
    }
  };

  public getHighlightAvaible = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      
      const listingsHiglighted = await this.listings.find({
        promoted: 'true',
        highlighted: true
      });
      const eventsHighlighted = await this.events.find({
        promoted: 'true',
        highlighted: true
      });

      const highlightsAvaible = MAX_HIGHLIGHTED_ITEMS - (listingsHiglighted.highlighted + eventsHighlighted.highlighted);
      res.status(STATUS_CODES.OK).json({
        data: {highlightsAvaible},
        message: 'Dashboard'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AdminDashboardController;
