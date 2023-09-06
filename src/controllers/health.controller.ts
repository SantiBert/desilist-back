import {NextFunction, Request, Response} from 'express';
import {STATUS_CODES} from '@constants/statusCodes';

class HealthController {
  public health = (req: Request, res: Response, next: NextFunction): void => {
    try {
      res
        .status(STATUS_CODES.OK)
        .json({uptime: process.uptime(), message: 'Server listening'});
    } catch (error) {
      next(error);
    }
  };
}

export default HealthController;
