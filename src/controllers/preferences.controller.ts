import {Response, NextFunction} from 'express';
import {STATUS_CODES} from '@constants/statusCodes';
import {UserPreferenceService} from '@/services';
import {RequestWithUser} from '@/interfaces/auth.interface';

class PreferencesController {
  public preferences = new UserPreferenceService();

  public unsubscribe = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      const unsubscriptions = req.body;
      await this.preferences.unsubscribe(user.id, unsubscriptions);

      res.status(STATUS_CODES.OK).json({message: 'OK'});
    } catch (error) {
      next(error);
    }
  };
}

export default PreferencesController;
