import {NextFunction, Response} from 'express';
import {STATUS_CODES, UserRoles} from '@/constants';
import {CreatePackageDto, PromotePackageDto} from '@/dtos/listingPackages.dto';
import {listingPackageNotFoundException} from '@/errors/listingPackages.error';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {ListingPackageService} from '@/services/admin/listingPackage.service';
import config from '@/config';
import {NOTIFICATION_TYPE} from '@/constants/notifications';
import notifications from '@/notifications';
import {NotificationService} from '@/services/notification.service';
import {ListingService} from '@/services/admin/listings.service';
import {getISONow} from '@/utils/time';

const NOTIFICATION_ENABLED = config.notification_service.enabled;
const $ListingPromoted = {
  title: 'Your listing was promoted',
  message: 'We promoted one of yours listings!'
};
class ListingPackageController {
  private notifications = new NotificationService();
  public listingPackageService = new ListingPackageService();
  private listings = new ListingService();

  public create = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const pack: CreatePackageDto = req.body;
      const activePackage = await this.listingPackageService.findActivePackage(
        pack.listing_id
      );

      pack['active'] = activePackage ? false : true;
      pack['activated_at'] = activePackage ? null : getISONow();
      pack['created_by'] = req.user.id;
      const newPack = await this.listingPackageService.create(pack as any);

      await this.listings.publishById(pack.listing_id);

      res
        .status(STATUS_CODES.OK)
        .json({data: {id: newPack.id}, message: 'created'});
    } catch (error) {
      next(error);
    }
  };

  public listingPackagePromote = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const promoteData: PromotePackageDto = req.body;

      const packageToUpdate = await this.listingPackageService.findById(
        promoteData.id
      );
      if (!packageToUpdate) {
        throw listingPackageNotFoundException('Listing not found');
      }

      const listingToPromote: any = await this.listings.findById(
        packageToUpdate.listing_id
      );
      await this.listingPackageService.promoteById(
        promoteData.id,
        promoteData.package_id,
        req.user.id
      );

      if (NOTIFICATION_ENABLED) {
        const notification: any = {
          user_id: listingToPromote.user.id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.LISTING_PROMOTED,
          seen: false,
          title: $ListingPromoted.title,
          message: $ListingPromoted.message,
          data: {listing: listingToPromote.id}
        };
        const notificationId = await this.notifications.create(
          notification as any
        );
        notification.id = notificationId.id;
        notification.created_at = notificationId.created_at;
        notifications.listingPromoted(notification);
      }

      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };

  public listingPackageCancelPromote = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const packageToUpdate = await this.listingPackageService.findById(id);
      if (!packageToUpdate) {
        throw listingPackageNotFoundException('Listing not found');
      }
      const listingToUpdate = await this.listings.findById(
        packageToUpdate.listing_id
      );
      if (!listingToUpdate) {
        throw listingPackageNotFoundException('Listing not found');
      }
      await this.listings.updateById(packageToUpdate.listing_id, {
        highlighted: false
      });

      await this.listingPackageService.cancelPromoteById(id);

      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };
}

export default ListingPackageController;
