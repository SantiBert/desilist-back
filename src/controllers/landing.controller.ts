import {NextFunction, Request, Response} from 'express';
import {S3} from '@/services';
import {STATUS_CODES} from '@/constants';
import { LandingService } from '@/services';
import config from '@/config';

const S3_BUCKET = config.aws.s3.bucket;
const S3_ACCESS_KEY_ID = config.aws.s3.access_key_id;
const S3_SECRET_ACCESS_KEY = config.aws.s3.secret_access_key;
const EVENTS_PATH = 'Event';
const ENV = config.environment;

class LandingController {
  
    public s3 = new S3(S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY);
    public landing = new LandingService();

    public getLandingHighlighted = async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const landing: Partial<any> = await this.landing.getLandingHighlighted();
        
        if (landing.events.length > 0) {
          for ( const [index, event] of landing.events.entries()) {
            // const files = await this.s3.getObjectslistFromFolder(`${ENV}/${event.publisher.id}/${EVENTS_PATH}/${event.id}/static_`);
            // landing.events[index]['images'] = files.Contents.map((file) => `https://${S3_BUCKET}.s3.amazonaws.com/${file.Key}`);
            if (event.has_banner) {
              landing.events[index]['images'] = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${event.publisher.id}/${EVENTS_PATH}/${event.id}/banner`;
            } else {
              landing.events[index]['images'] = 'https://desilist-1.s3.us-east-2.amazonaws.com/Assets/Website/ListingPlaceHolderChico.PNG';
            }   
          }
        }
        
        res.status(STATUS_CODES.OK).json({data: landing, message: 'findAll'});
      } catch (error) {
        next(error);
      }
    };

  }
  
  
  export default LandingController;
  