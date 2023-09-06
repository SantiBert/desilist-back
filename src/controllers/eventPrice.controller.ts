import {NextFunction, Request, Response} from 'express';
import {EventPrice} from '@prisma/client';
import {EventPriceService} from '@/services';
import {STATUS_CODES} from '@/constants';

import {CreateEventPriceDto, UpdateEventPriceDto} from '@/dtos/eventPrice.dto';

class EventPriceController {
  public event_price = new EventPriceService();

  public findPricingBySubcategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const subcategoryId = parseInt(req.params.id);

      const pricing = await this.event_price.findPricingBySubcategory(
        subcategoryId
      );

      res.status(200).json({data: {pricing}, message: 'Pricing retrieved'});
    } catch (error) {
      next(error);
    }
  };
}

export default EventPriceController;
