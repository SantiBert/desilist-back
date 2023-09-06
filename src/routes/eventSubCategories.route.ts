import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import AdminEventSubcategoryController from '@/controllers/admin/eventSubcategories.controller';
import {checkAPIVersion, } from '@/middlewares/apiVersion.middleware';

class EventSubcategoryRoute implements Routes {
    public path = '/events/subcategories';
    public router = Router();
    public eventSubcategoryController = new AdminEventSubcategoryController();

    public constructor() {
        this.initializeRoutes();
    }
    
    private initializeRoutes(): void {
      this.router.get(`${this.path}`,
        checkAPIVersion,
        this.eventSubcategoryController.getEventSubCategories
      );

      this.router.get(
        `${this.path}/:id`,
        checkAPIVersion,
        this.eventSubcategoryController.getEventSubcategoryById
      );
  }
  
}

export default EventSubcategoryRoute;