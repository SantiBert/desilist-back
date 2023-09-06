import {NextFunction, Request, Response} from 'express';
import {STATUS_CODES} from '@/constants';
import {ListingFlagReportReasonsService} from '@/services';
import {ListingFlagReportReason} from '@prisma/client';

class ListingFlagReportReasonsController {
  public flagReportReason = new ListingFlagReportReasonsService();

  public getFlagReasons = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const flagReportReasonData: Partial<ListingFlagReportReason>[] =
        await this.flagReportReason.find();

      res
        .status(STATUS_CODES.OK)
        .json({data: flagReportReasonData, message: 'findAll'});
    } catch (error) {
      next(error);
    }
  };
}

export default ListingFlagReportReasonsController;
