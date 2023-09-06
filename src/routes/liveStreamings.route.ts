import {Router} from 'express';
import {Routes} from '@interfaces/routes.interface';
import LiveStreamingController from '@/controllers/liveStreaming.controller';
import {checkAPIVersion, } from '@/middlewares/apiVersion.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';

import {
    CreateLiveStreamingDto,
    GetStreamingDto,
    UpdateStreamingDto,
    DeleteStreamingDto
  } from '@/dtos/liveStreamings.dto';
  

class LiveStreamingRoute implements Routes {
    public path = '/live-streaming';
    public router = Router();
    public liveStreamingController = new LiveStreamingController();

    public constructor() {
        this.initializeRoutes();
    }
    
    private initializeRoutes(): void {
      this.router.get(
        `${this.path}/:id`,
        checkAPIVersion,
        authMiddleware(),
        this.liveStreamingController.getLiveStreamingById
      );
      this.router.post(
        `${this.path}/create/`,
        checkAPIVersion,
        validationMiddleware(CreateLiveStreamingDto, 'body'),
        authMiddleware(),
        this.liveStreamingController.createLiveStreaming
      );
      this.router.patch(
        `${this.path}/:id`,
        checkAPIVersion,
        validationMiddleware(UpdateStreamingDto, 'body'),
        authMiddleware(),
        this.liveStreamingController.updateLiveStreaming
      );
      this.router.delete(
        `${this.path}/:id`,
        checkAPIVersion,
        authMiddleware(),
        this.liveStreamingController.deleteLiveStreaming
      );
  }
  
}

export default LiveStreamingRoute;