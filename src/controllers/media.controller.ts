import {NextFunction, Request, Response} from 'express';
import {Media} from '@prisma/client';
import {MediaService} from '@/services';
import {STATUS_CODES} from '@/constants';
import {
  CreateMediaDto,
  UpdateMediaDto,
  GetMediaDto,
  DeleteMediaDto
} from '@/dtos/media.dto';

class MediaController {
  
    public media = new MediaService();
  
    public createMedia = async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {

      try {
        const mediaData: CreateMediaDto = req.body;

        const createdMedia = await this.media.create(
          mediaData
        );
        res.status(STATUS_CODES.OK).json({message: 'media created'});
      } catch (error) {
        next(error);
      }
    };

    public updateMedia = async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {

      try {
        const id = Number(req.params.id);
        const mediaData: UpdateMediaDto = req.body;

        const mediaExist: Partial<Media> = await this.media.findById(id);

        if (!mediaExist) {
          res
          .status(STATUS_CODES.NOT_FOUND)
          .json({message: 'media not found'});
        } else {
          const upDatedMedia = await this.media.updateById(
            id,
            mediaData
          );
          
          res
          .status(STATUS_CODES.OK)
          .json({message: 'media updated'});
        }
      } catch (error) {
        next(error);
      }
    };

    public deleteMedia = async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const id = Number(req.params.id);
        const mediaData: DeleteMediaDto = req.body;

        const mediaExist: Partial<Media> = await this.media.findById(id);

        if (!mediaExist) {
          res
          .status(STATUS_CODES.NOT_FOUND)
          .json({message: 'media not found'});
        } else {
          const deletedMedia = await this.media.delete(
            id
          );
          
          res
          .status(STATUS_CODES.OK)
          .json({message: 'media deleted'});
        }
      } catch (error) {
        next(error);
      }
    };

    public getMediaList = async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const liveStreamingData: Partial<Media>[] = await this.media.find();
  
        res.status(STATUS_CODES.OK).json({data: liveStreamingData, message: 'findAll'});
      } catch (error) {
        next(error);
      }
    };

    public getMediaById = async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const id = Number(req.params.id);
        const mediaData: Partial<Media> =
          await this.media.findById(id);
          
        if (!mediaData) {
          res
          .status(STATUS_CODES.NOT_FOUND)
          .json({message: 'media not found'});
        } else {
          res
          .status(STATUS_CODES.OK)
          .json({data: mediaData, message: 'findOne'});
        }
      } catch (error) {
        next(error);
      }
    };
  }
  
  
  export default MediaController;
  