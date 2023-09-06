import {NextFunction, Request, Response} from 'express';
import {StripeService} from '@/services';
import {STATUS_CODES} from '@/constants';
import config from '@/config';
import {CreateTokenCVCDto} from '@/dtos/tokens.dto';

const STRIPE_API_KEY = config.payment_gateway.stripe.api_key;

class TokensController {
  public stripe = new StripeService(STRIPE_API_KEY, {apiVersion: '2020-08-27'});

  public createCVCToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cardData: CreateTokenCVCDto = req.body;
      const createdToken = await this.stripe.createCVCToken(cardData.cvc);

      res
        .status(STATUS_CODES.CREATED)
        .json({data: {id: createdToken}, message: 'Token created'});
    } catch (error) {
      next(error);
    }
  };
}

export default TokensController;
