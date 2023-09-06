import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import aclMiddleware from '@/middlewares/acl.middleware';
import {UserRoles} from '../../constants/user.constants';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import AdminDashboardController from '@/controllers/admin/dashboard.controller';

class AdminDashboardRoute implements Routes {
  public path = '/admin/dashboard';
  public router = Router();
  public dashboardController = new AdminDashboardController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.dashboardController.getDashboard
    );

    this.router.get(
      `/admin/highlight-avaible`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.dashboardController.getHighlightAvaible
    );
  }
}

export default AdminDashboardRoute;
