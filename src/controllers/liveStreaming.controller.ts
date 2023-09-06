import {NextFunction, Request, Response} from 'express';
import {LiveStreaming} from '@prisma/client';
import {LiveStreamingService} from '@/services';
import {STATUS_CODES} from '@/constants';
import {
  CreateLiveStreamingDto,
  GetStreamingDto,
  UpdateStreamingDto,
  DeleteStreamingDto
} from '@/dtos/liveStreamings.dto';

class LiveStreamingController {
  
    public lives_streaming = new LiveStreamingService();
  
    public createLiveStreaming = async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {

      try {
        const liveStreamingData: CreateLiveStreamingDto = req.body;

        const createdLiveStreaming = await this.lives_streaming.create(
          liveStreamingData
        );
        res.status(STATUS_CODES.OK).json({message: 'live streaming created'});
      } catch (error) {
        next(error);
      }
    };

    public updateLiveStreaming = async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {

      try {
        const id = Number(req.params.id);
        const liveStreamingData: UpdateStreamingDto = req.body;

        const liveStreamingExist: Partial<LiveStreaming> = await this.lives_streaming.findById(id);

        if (!liveStreamingExist) {
          res
          .status(STATUS_CODES.NOT_FOUND)
          .json({message: 'live streaming not found'});
        } else {
          const upDatedLiveStreaming = await this.lives_streaming.updateById(
            id,
            liveStreamingData
          );
          
          res
          .status(STATUS_CODES.OK)
          .json({message: 'live streaming updated'});
        }
      } catch (error) {
        next(error);
      }
    };

    public deleteLiveStreaming = async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const id = Number(req.params.id);
        const liveStreamingData: DeleteStreamingDto = req.body;

        const liveStreamingExist: Partial<LiveStreaming> = await this.lives_streaming.findById(id);

        if (!liveStreamingExist) {
          res
          .status(STATUS_CODES.NOT_FOUND)
          .json({message: 'live streaming not found'});
        } else {
          const deletedLiveStreaming = await this.lives_streaming.delete(
            id
          );
          
          res
          .status(STATUS_CODES.OK)
          .json({message: 'live streaming deleted'});
        }
      } catch (error) {
        next(error);
      }
    };

    public getLiveStreamingById = async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const id = Number(req.params.id);
        const liveStreamingData: Partial<LiveStreaming> =
          await this.lives_streaming.findById(id);
          
        if (!liveStreamingData) {
          res
          .status(STATUS_CODES.NOT_FOUND)
          .json({message: 'live streaming not found'});
        } else {
          res
          .status(STATUS_CODES.OK)
          .json({data: liveStreamingData, message: 'findOne'});
        }
      } catch (error) {
        next(error);
      }
    };
  }
  
  
  export default LiveStreamingController;
  