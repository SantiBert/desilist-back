import {Router} from 'express';
import UsersController from '@controllers/users.controller';
import {
  GetUserDto,
  MeUserDto,
  UpdateUserDto,
  DeleteUserDto,
  DisableUserDto,
  ChangeUserPasswordDto
} from '@dtos/users.dto';
import {Routes} from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import {USER_ID_FORMAT_REGEX} from '@/constants/user.constants';
import authMiddleware from '@/middlewares/auth.middleware';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';

class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}/:id(${USER_ID_FORMAT_REGEX})`,
      checkAPIVersion,
      validationMiddleware(GetUserDto, 'body'),
      authMiddleware(true),
      this.usersController.getUserById
    );
    this.router.get(
      `${this.path}/me`,
      checkAPIVersion,
      validationMiddleware(MeUserDto, 'body'),
      authMiddleware(),
      this.usersController.getCurrentUser
    );
    this.router.patch(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(UpdateUserDto, 'body'),
      authMiddleware(),
      this.usersController.updateUser
    );
    this.router.delete(
      `${this.path}`,
      checkAPIVersion,
      validationMiddleware(DeleteUserDto, 'body'),
      authMiddleware(),
      this.usersController.deleteUser
    );
    this.router.patch(
      `${this.path}/disable`,
      checkAPIVersion,
      validationMiddleware(DisableUserDto, 'body'),
      authMiddleware(),
      this.usersController.disableUser
    );
    this.router.post(
      `${this.path}/change_password`,
      checkAPIVersion,
      validationMiddleware(ChangeUserPasswordDto, 'body'),
      authMiddleware(),
      this.usersController.changePassword
    );
    this.router.get(
      `${this.path}/notifications`,
      checkAPIVersion,
      authMiddleware(),
      this.usersController.getUnreadNotifications
    );
  }
}

export default UsersRoute;
