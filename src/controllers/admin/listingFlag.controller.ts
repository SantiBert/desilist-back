import {NextFunction, Request, Response} from 'express';
import {STATUS_CODES} from '@/constants';
import {ListingFlagService} from '@/services/admin/listingFlag.service';

class ListingFlagController {
  public listingsFlag = new ListingFlagService();
  public getFlaggedListings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params = req.query;
      const listingsReported = await this.listingsFlag.getAllListingReported(
        params
      );

      const {listings, total, cursor, pages} = listingsReported;

      res.status(STATUS_CODES.OK).json({
        data: {listings, total, cursor, pages},
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };

  public getReportByListingId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const listingsReports = await this.listingsFlag.getReportByListingId(id);

      res.status(STATUS_CODES.OK).json({
        data: listingsReports,
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };

  public newChanges = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const listingsReports = await this.listingsFlag.getReportByListingId(id);

      res.status(STATUS_CODES.OK).json({
        data: listingsReports,
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };

  public seenNewChanges = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const listingsReports = await this.listingsFlag.getReportByListingId(id);

      res.status(STATUS_CODES.OK).json({
        data: listingsReports,
        message: 'updatedAll'
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ListingFlagController;
