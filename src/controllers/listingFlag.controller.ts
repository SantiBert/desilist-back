import {NextFunction, Request, Response} from 'express';
import {STATUS_CODES} from '@/constants';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {User} from '@prisma/client';
import {ListingService, ListingFlagService} from '@/services';
import {
  listingNotFoundException,
  listingUnathorizedException
} from '@/errors/listings.error';

class ListingFlagController {
  public listings = new ListingService();
  public listingsFlag = new ListingFlagService();

  public getFlagByListingId = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const currentUser: User = req.user;

      const findListing: any = await this.listings.findById(id);
      if (!findListing) {
        throw listingNotFoundException('Listing not found');
      }

      if (findListing.user.id !== currentUser.id) {
        throw listingUnathorizedException('Insufficient Permissions');
      }

      const listingFlag = await this.listingsFlag.getFlagByListingId(id);

      res.status(STATUS_CODES.OK).json({
        data: listingFlag,
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };

  // public newChanges = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> => {
  //   try {
  //     const id = Number(req.params.id);
  //     const listingsReports = await this.listingsFlag.getReportByListingId(id);

  //     res.status(STATUS_CODES.OK).json({
  //       data: listingsReports,
  //       message: 'findAll'
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // public seenNewChanges = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> => {
  //   try {
  //     const id = Number(req.params.id);
  //     const listingsReports = await this.listingsFlag.getReportByListingId(id);

  //     res.status(STATUS_CODES.OK).json({
  //       data: listingsReports,
  //       message: 'updatedAll'
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}

export default ListingFlagController;
