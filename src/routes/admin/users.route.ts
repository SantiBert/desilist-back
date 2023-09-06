import {Router} from 'express';
import AdminUsersController from '@controllers/admin/users.controller';
import {UpdateUserDto} from '@dtos/users.dto';
import {Routes} from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import {UserRoles, USER_ID_FORMAT_REGEX} from '@/constants/user.constants';
import authMiddleware from '@/middlewares/auth.middleware';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import aclMiddleware from '@/middlewares/acl.middleware';

class AdminUsersRoute implements Routes {
  public path = '/admin/users';
  public router = Router();
  public usersController = new AdminUsersController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.usersController.getUsers
    );
    this.router.get(
      `${this.path}/:id(${USER_ID_FORMAT_REGEX})`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.usersController.getUserById
    );
    this.router.patch(
      `${this.path}/:id(${USER_ID_FORMAT_REGEX})`,
      checkAPIVersion,
      validationMiddleware(UpdateUserDto, 'body'),
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.usersController.updateUser
    );
    this.router.delete(
      `${this.path}/:id(${USER_ID_FORMAT_REGEX})`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.usersController.deleteUser
    );
    this.router.patch(
      `${this.path}/:id(${USER_ID_FORMAT_REGEX})/disable`,
      checkAPIVersion,
      authMiddleware(),
      aclMiddleware(UserRoles.ADMIN),
      this.usersController.disableUser
    );
  }
}

export default AdminUsersRoute;
