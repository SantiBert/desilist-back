import {Router} from 'express';
import HealthController from '@controllers/health.controller';
import {Routes} from '@interfaces/routes.interface';

class HealthRoute implements Routes {
  public path = '/';
  public router = Router();
  public healthController = new HealthController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(`${this.path}health`, this.healthController.health);
  }
}

export default HealthRoute;
