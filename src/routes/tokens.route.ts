import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import TokensController from '@/controllers/tokens.controller';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import {CreateTokenCVCDto} from '@/dtos/tokens.dto';
import validationMiddleware from '@/middlewares/validation.middleware';

class TokensRoute implements Routes {
  public path = '/tokens';
  public router = Router();
  public tokensController = new TokensController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}/cvc`,
      checkAPIVersion,
      validationMiddleware(CreateTokenCVCDto, 'body'),
      authMiddleware(),
      this.tokensController.createCVCToken
    );
  }
}

export default TokensRoute;
