import {NextFunction, Request, Response} from 'express';
import {Listing} from '@prisma/client';
import {STATUS_CODES, UserRoles} from '@/constants';
import {CreateListingDto, UpdateListingDto} from '@/dtos/listings.dto';
import {ListingService} from '@/services/admin/listings.service';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {LISTING_STATUS} from '@/constants/listingStatus';
import {
  invalidFlagReasonsException,
  listingNotFoundException,
  listingTooManyImagesException
} from '@/errors/listings.error';
import {getISONow} from '@/utils/time';
import {S3, SendGridService} from '@/services';
import config from '@/config';
import {GetAllListing} from '@/interfaces/listing.interface';
import {ListingPackageService} from '@/services/admin/listingPackage.service';
import notifications from '@/notifications';
import {NotificationService} from '@/services/notification.service';
import {NOTIFICATION_TYPE} from '@/constants/notifications';
import {ImageFormat, ImageManip} from '@/utils/imageManip';
import {ListingFlagService} from '@/services/admin/listingFlag.service';

const S3_BUCKET = config.aws.s3.bucket;
const S3_ACCESS_KEY_ID = config.aws.s3.access_key_id;
const S3_SECRET_ACCESS_KEY = config.aws.s3.secret_access_key;
const NOTIFICATION_ENABLED = config.notification_service.enabled;
const MAILER_ENABLED = config.mailer.enabled;
const LISTING_PATH = 'Listing';
const ENV = config.environment;
const FE_URL = config.frontend.url;
const FE_UNSUSCRIBE_ENDP = config.frontend.endpoints.unsuscribe;
const FE_FLAGGED = config.frontend.endpoints.flagged;

const $ListingEdited = {
  title: 'Your listing has been edited',
  message: 'We made some changes on your listing, click to see more!'
};
const $ListingFlaged = {
  title: 'Your listing has been flagged',
  message:
    'One of your listings has been flagged as not appropriate, click on View More to find out more.'
};

const $ListingDeleted = {
  title: 'Your listing has been deleted',
  message: 'One of your listings has been deleted by an Admin'
};
const $ListingFlagedApproved = {
  title: 'Your flagged listing is active again',
  message: 'A listing that was flagged has been approved and is back online!'
};
class ListingsController {
  public listings = new ListingService();
  public listingsPackages = new ListingPackageService();
  public listingsFlag = new ListingFlagService();
  public s3 = new S3(S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY);
  public imageManip = new ImageManip();
  private MAX_NUMBER_FILES = 6;
  private notifications = new NotificationService();
  private sendgrid = new SendGridService();

  public getListings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params = req.query;

      const listingsData: Partial<GetAllListing> = await this.listings.find(
        params
      );

      const {listings, total, cursor, pages} = listingsData;

      // fix: remove promoted property
      for (let i = 0; i < listings.length; ++i) {
        if (
          listings[i].listing_packages &&
          listings[i].listing_packages.filter(
            (listingPackage) =>
              listingPackage.active &&
              listingPackage.paused_at === null &&
              listingPackage.promote_package
          ).length > 0
        ) {
          listings[i]['promoted'] = true;
        } else {
          listings[i]['promoted'] = false;
        }
      }

      res.status(STATUS_CODES.OK).json({
        data: {listings, total, cursor, pages},
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };

  public getListingById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const findListing: any = await this.listings.findById(id);
      if (!findListing) {
        throw listingNotFoundException('Listing not found');
      }
      /*
      findListing['promoted'] =
        findListing.listing_packages[0] &&
        findListing.listing_packages[0].promote_package
          ? true
          : false;
      */
      if (
        findListing.listing_packages.length > 0 &&
        findListing.listing_packages.filter(
          (listingPackage) =>
            listingPackage.active &&
            listingPackage.paused_at === null &&
            listingPackage.promote_package
        ).length > 0
      ) {
        findListing['promoted'] = true;
      } else {
        findListing['promoted'] = false;
      }

      if (findListing.images) {
        for await (const image of findListing.images) {
          const key = findListing.images.indexOf(image);
          const imageName = image.split('.com/');
          const metadata = await this.s3.getMetaData(imageName[1]);
          findListing.images[key] = {
            position: key,
            url: image,
            metadata
          };
        }
      }

      
      res.status(STATUS_CODES.OK).json({data: findListing, message: 'findOne'});
    } catch (error) {
      next(error);
    }
  };

  public createListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const listingData: CreateListingDto = req.body;
      const images = [];
      const data = {
        ...listingData,
        user_id: req.user.id,
        status_id: LISTING_STATUS.DRAFT
      };
      const createdListing = await this.listings.create(data as any);
      if (!createdListing) {
        throw new Error('Server Error');
      }

      if (listingData.images.length > this.MAX_NUMBER_FILES) {
        throw listingTooManyImagesException('Too many files');
      }

      if (listingData.images.length > 0) {
        let i = 0;
        for await (const image of listingData.images) {
          const imageUrl = await this.uploadImage(
            image,
            `${ENV}/${createdListing.user_id}/${LISTING_PATH}/${createdListing.id}/`,
            `static_${i++}`
          );
          images.push(imageUrl);
        }
        await this.listings.updateById(createdListing.id, {images: images});
      }

      res.status(STATUS_CODES.CREATED).json({message: 'created'});
    } catch (error) {
      next(error);
    }
  };

  public updateListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const updateData: UpdateListingDto = req.body;
      // sin esto, los listings pasan a ser del Admin, no borrar
      delete updateData.user_id;
      const listingToUpdate: any = await this.listings.findById(id);
      if (!listingToUpdate) {
        throw listingNotFoundException('Listing not found');
      }

      updateData.images = await this.checkPhotosByMetadata(
        listingToUpdate,
        updateData
      );

      await this.listings.updateById(id, updateData);

      if (NOTIFICATION_ENABLED) {
        const notification: any = {
          user_id: listingToUpdate.user.id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.LISTING_EDITED,
          seen: false,
          title: $ListingEdited.title,
          // message: `Listing ${listingToUpdate.id} was edited by admin`
          message: $ListingEdited.message,
          data: {listing: listingToUpdate.id}
        };
        const notificationId = await this.notifications.create(
          notification as any
        );
        notification.id = notificationId.id;
        notification.created_at = notificationId.created_at;
        notifications.listingEdited(notification);
      }

      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };

  public deleteListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const listingToDelete: any = await this.listings.findById(id);
      if (!listingToDelete) {
        throw listingNotFoundException('Listing not found');
      }

      await this.listings.updateById(id, {
        highlighted: false,
        status_id: LISTING_STATUS.INACTIVE,
        deleted_at: getISONow()
      });

      if (NOTIFICATION_ENABLED) {
        const notification: any = {
          user_id: listingToDelete.user.id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.LISTING_DELETE,
          seen: false,
          title: $ListingDeleted.title,
          // message: `Listing ${listingToFlag.id} flagged for user: ${listingToFlag.user_id}`
          message: $ListingDeleted.message,
          data: {listing: listingToDelete.id}
        };
        const notificationId = await this.notifications.create(
          notification as any
        );
        notification.id = notificationId.id;
        notification.created_at = notificationId.created_at;
        if (MAILER_ENABLED) {
          const card = {
            title: listingToDelete.title,
            category: `${listingToDelete.subcategory.category.name} > ${listingToDelete.subcategory.name}`
          };
          const redirectUrl = `${FE_URL}/contact-us`;
          const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
          await this.sendgrid.listingDeleted(
            listingToDelete.user.email,
            card,
            redirectUrl,
            unsubscribe
          );
        }
        /* check name of the method */
        notifications.listingPromoted(notification);
      }

      res.status(STATUS_CODES.OK).json({message: 'deleted'});
    } catch (error) {
      next(error);
    }
  };

  public pauseListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const listingToPause = await this.listings.findById(id);
      if (!listingToPause) {
        throw listingNotFoundException('Listing not found');
      }

      await this.listings.pauseById(id);

      res.status(STATUS_CODES.OK).json({message: 'Listing Paused'});
    } catch (error) {
      next(error);
    }
  };

  public unpauseListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const listingToUnpause = await this.listings.findById(id);
      if (!listingToUnpause) {
        throw listingNotFoundException('Listing not found');
      }

      await this.listings.unpauseById(id);

      res.status(STATUS_CODES.OK).json({message: 'Listing Unpaused'});
    } catch (error) {
      next(error);
    }
  };

  public highlightListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const listingToHighlight = await this.listings.findById(id);
      if (!listingToHighlight) {
        throw listingNotFoundException('Listing not found');
      }

      await this.listings.highlightById(id);

      res.status(STATUS_CODES.OK).json({message: 'Listing Highlighted'});
    } catch (error) {
      next(error);
    }
  };

  public cancelHighlightListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const listingToCancelHighlight = await this.listings.findById(id);
      if (!listingToCancelHighlight) {
        throw listingNotFoundException('Listing not found');
      }

      await this.listings.cancelhighlightById(id);

      res.status(STATUS_CODES.OK).json({message: 'Listing Highlight removed'});
    } catch (error) {
      next(error);
    }
  };

  public promoteListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const promoteData = req.body;

      const listingToPromote = await this.listings.findById(id);
      if (!listingToPromote) {
        throw listingNotFoundException('Listing not found');
      }

      const listingPackage = await this.listingsPackages.findActivePackage(id);
      await this.listingsPackages.promoteById(
        listingPackage.id,
        promoteData.promote_package_id,
        req.user.id
      );
      /*
      if (NOTIFICATION_ENABLED) {
        const notification = {
          user_id: listingToPromote.user_id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.LISTING_PROMOTED,
          seen: false,
          message: `Listing ${listingToPromote.id} promoted for user: ${listingToPromote.user_id}`
        };
        await this.notifications.create(notification as any);
        notifications.listingPromoted(notification);
      }
      */
      res.status(STATUS_CODES.OK).json({message: 'Listing Promoted'});
    } catch (error) {
      next(error);
    }
  };

  public flagListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const data = req.body;

      const listingToFlag: any = await this.listings.findById(id);
      if (!listingToFlag) {
        throw listingNotFoundException('Listing not found');
      }

      // todo: add control if any reason_id does not exist in listing_flag_report_reason, throw exception
      if (data.reasons.length <= 0) {
        throw invalidFlagReasonsException('Invalid Flag Reasons');
      }
      // delete previous Flags, only 1 active at the moment
      const flagsUpdated = await this.listingsFlag.updateFlagged(id, {
        deleted_at: getISONow(),
        dismissed: true
      });

      await this.listingsFlag.createFlagged({
        listing_id: id,
        reasons_id: data.reasons,
        comment: data.comment,
        dismissed: false,
        new_changes: false
      });

      await this.listings.flagById(id);

      if (NOTIFICATION_ENABLED) {
        const notification: any = {
          user_id: listingToFlag.user.id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.LISTING_FLAGGED,
          seen: false,
          title: $ListingFlaged.title,
          // message: `Listing ${listingToFlag.id} flagged for user: ${listingToFlag.user_id}`
          message: $ListingFlaged.message,
          data: {listing: listingToFlag.id}
        };
        const notificationId = await this.notifications.create(
          notification as any
        );
        notification.id = notificationId.id;
        notification.created_at = notificationId.created_at;
        if (MAILER_ENABLED) {
          const card = {
            title: listingToFlag.title,
            category: `${listingToFlag.subcategory.category.name} > ${listingToFlag.subcategory.name}`,
            vendor: listingToFlag.user.full_name,
            link: `${FE_URL}/listing-detail/${listingToFlag.id}`,
            changes: 'Need Corrections'
          };
          const redirectUrl = `${FE_URL}/${FE_FLAGGED}`;
          const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
          if (flagsUpdated.count > 1) {
            await this.sendgrid.listingFlaggedDenied(
              listingToFlag.user.email,
              card,
              redirectUrl,
              unsubscribe
            );
          } else {
            await this.sendgrid.listingFlagged(
              listingToFlag.user.email,
              card,
              redirectUrl,
              unsubscribe
            );
          }
        }
        /* check name of the method */
        notifications.listingPromoted(notification);
      }

      res.status(STATUS_CODES.OK).json({message: 'Listing Flagged'});
    } catch (error) {
      next(error);
    }
  };

  public unflagListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const listingToUnpause: any = await this.listings.findById(id);
      if (!listingToUnpause) {
        throw listingNotFoundException('Listing not found');
      }

      await this.listingsFlag.updateFlagged(id, {
        deleted_at: getISONow(),
        dismissed: true
      });

      await this.listingsFlag.updateReportsByListingId(id, {
        dismissed: true
      });

      await this.listings.unflagById(id);

      if (NOTIFICATION_ENABLED) {
        const notification: any = {
          user_id: listingToUnpause.user.id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.LISTING_FLAG_APPROVED,
          seen: false,
          title: $ListingFlagedApproved.title,
          // message: `Listing ${listingToUnpause.id} flagged for user: ${listingToUnpause.user_id}`
          message: $ListingFlagedApproved.message,
          data: {listing: listingToUnpause.id}
        };
        const notificationId = await this.notifications.create(
          notification as any
        );
        notification.id = notificationId.id;
        notification.created_at = notificationId.created_at;
        if (MAILER_ENABLED) {
          const card = {
            title: listingToUnpause.title,
            category: `${listingToUnpause.subcategory.category.name} > ${listingToUnpause.subcategory.name}`,
            vendor: listingToUnpause.user.full_name,
            link: `${FE_URL}/listing-detail/${listingToUnpause.id}`
          };
          const redirectUrl = `${FE_URL}/app/dashboard`;
          const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
          await this.sendgrid.listingFlaggedApproved(
            listingToUnpause.user.email,
            card,
            redirectUrl,
            unsubscribe
          );
        }
        /* check name of the method */
        notifications.listingPromoted(notification);
      }

      res.status(STATUS_CODES.OK).json({message: 'Listing Unflagged'});
    } catch (error) {
      next(error);
    }
  };

  private checkPhotosByMetadata = async (
    listing: Partial<Listing>,
    updateListingData: Partial<any>
  ): Promise<string[]> => {
    const newImages = [];
    const updateImages = updateListingData.images;

    let i = 0;
    for await (const image of updateImages) {
      //if image it's new
      if (image.data) {
        const position = image.position;
        const imageUrl = await this.uploadImage(
          image.data,
          `${ENV}/${listing.user_id}/${LISTING_PATH}/${listing.id}/`,
          `static_${i++}`
        );
        newImages[position] = imageUrl;
      } else if (image.url) {
        //if image already exist
        const url = image.url;
        const position = image.position;
        newImages[position] = url;
      }
    }
    //check if any of the listings images was deleted
    for await (const image of listing.images) {
      if (!newImages.includes(image)) {
        this.s3.remove(image);
      }
    }
    return newImages;
  };

  private uploadImage = async (
    image: string,
    path: string,
    name: string
  ): Promise<string> => {
    const imgFmt = ImageFormat.webp;
    this.imageManip.setImage(
      Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    );
    await this.imageManip.convert(imgFmt);
    const processed = this.imageManip.getProcessed();
    const url = await this.s3.upload(path, name, processed.converted, {
      contentEncoding: 'base64',
      contentType: imgFmt
    });
    return url;
  };
}

export default ListingsController;
