import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import MediaController from '@/controllers/media.controller';
import {checkAPIVersion, } from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import aclMiddleware from '@/middlewares/acl.middleware';

import {UserRoles} from '../constants/user.constants';

import {
    CreateMediaDto,
    UpdateMediaDto,
    GetMediaDto,
    DeleteMediaDto
  } from '@/dtos/media.dto';
  

class MediaRoute implements Routes {
    public path = '/media';
    public router = Router();
    public mediaController = new MediaController();

    public constructor() {
        this.initializeRoutes();
    }
    
    private initializeRoutes(): void {
      this.router.get(
        `${this.path}/all/`,
        checkAPIVersion,
        validationMiddleware(GetMediaDto, 'params'),
        authMiddleware(),
        this.mediaController.getMediaList
      );
      this.router.get(
        `${this.path}/:id`,
        checkAPIVersion,
        authMiddleware(),
        this.mediaController.getMediaById
      );
      this.router.post(
        `${this.path}/create/`,
        checkAPIVersion,
        validationMiddleware(CreateMediaDto, 'body'),
        authMiddleware(),
        aclMiddleware(UserRoles.ADMIN),
        this.mediaController.createMedia
      );
      this.router.patch(
        `${this.path}/:id`,
        checkAPIVersion,
        validationMiddleware(UpdateMediaDto, 'body'),
        authMiddleware(),
        aclMiddleware(UserRoles.ADMIN),
        this.mediaController.updateMedia
      );
      this.router.delete(
        `${this.path}/:id`,
        checkAPIVersion,
        authMiddleware(),
        aclMiddleware(UserRoles.ADMIN),
        this.mediaController.deleteMedia
      );
  }
  
}

export default MediaRoute;