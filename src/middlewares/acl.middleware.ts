import {Response, NextFunction, RequestHandler} from 'express';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {UserRoles} from '@/constants/user.constants';
import {roleLackPermissionException} from '@/errors/auth.error';

const aclMiddleware =
  (authorizedRoles: UserRoles): RequestHandler =>
  (req: RequestWithUser, res: Response, next: NextFunction): void => {
    try {
      if (req.user.role_id <= authorizedRoles) {
        next();
      } else {
        throw roleLackPermissionException('Lack of permission');
      }
    } catch (error) {
      next(roleLackPermissionException('Lack of permission'));
    }
  };
export default aclMiddleware;
