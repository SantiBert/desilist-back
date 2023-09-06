import fs from 'fs';
import {NextFunction, Request, Response} from 'express';
import {Listing, User} from '@prisma/client';
import {STATUS_CODES, UserRoles} from '@/constants';
import {CreateListingDto, UpdateListingDto} from '@/dtos/listings.dto';
import {
  BookmarkService,
  ListingService,
  SendGridService,
  UserService
} from '@/services';
import {ValidationService} from '@/services';
import {LISTING_STATUS} from '@/constants/listingStatus';
import {
  listingCantPublishException,
  listingNotFoundException,
  listingTooManyImagesException,
  listingUnathorizedException,
  listingWithoutActivePackageException
} from '@/errors/listings.error';
import {diffToNowForHumans, getISONow} from '@/utils/time';
import {S3} from '@/services';
import config from '@/config';
import {GetAllListing} from '@/interfaces/listing.interface';
import axios from 'axios';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {ListingFlagReportService} from '@/services/listingFlagReport.service';
import notifications from '@/notifications';
import {NotificationService} from '@/services/notification.service';
import {NOTIFICATION_TYPE} from '@/constants/notifications';
import {ListingPackageService} from '@/services/listingPackage.service';
import {GetAllListingCsv} from '../interfaces/listing.interface';
import isbot from 'isbot';
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
const FE_ADMIN_FLAGGED = config.frontend.endpoints.admin_flagged;

class ListingsController {
  public listings = new ListingService();
  public listingsPackages = new ListingPackageService();
  public flagReport = new ListingFlagReportService();
  public listingsFlag = new ListingFlagService();
  public bookmarks = new BookmarkService();
  public users = new UserService();
  public s3 = new S3(S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY);
  public imageManip = new ImageManip();
  private validation = new ValidationService();
  private user = new UserService();
  private notifications = new NotificationService();
  private sendgrid = new SendGridService();
  private MAX_NUMBER_FILES = 6;

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

      const {listings, highlighted, total, cursor, pages} = listingsData;

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
        data: {listings, highlighted, total, cursor, pages},
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };

  public getListingsMe = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      const params = req.query;

      const listingsData: Partial<GetAllListing> =
        await this.listings.findByUser(user.id, params, true);
      const {listings, highlighted, total, cursor, pages} = listingsData;

      // fix: remove promoted property
      for (let i = 0; i < listings.length; ++i) {
        listings[i]['expiry'] = diffToNowForHumans(listings[i].created_at);
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
        data: {listings, highlighted, total, cursor, pages},
        message: 'OK'
      });
    } catch (error) {
      next(error);
    }
  };

  public getListingById = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const findListing: any = await this.listings.findById(id);
      if (!findListing) {
        throw listingNotFoundException('Listing not found');
      }

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

      if (!req.user && findListing.contact) {
        Object.keys(findListing.contact).map((key) => {
          findListing.contact[key] = findListing.contact[key].replace(
            /./g,
            '*'
          );
        });
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
        images_json: {}, // todo: remove this prop
        user_id: req.user.id,
        status_id: LISTING_STATUS.DRAFT
      };

      // console.log(listingData.images.length);
      // console.log(await this.uploadPhotos(1, listingData.images));
      // throw new Error('Server Error');
      const createdListing = await this.listings.create(data as any);
      if (!createdListing) {
        throw new Error('Server Error');
      }

      if (listingData.images.length > this.MAX_NUMBER_FILES) {
        throw listingTooManyImagesException('Too many files');
      }

      // new flow
      /*
      if (listingData.images.length > 0) {
        const photosUrl = await this.uploadPhotos(
          createdListing.id,
          listingData.images
        );
        await this.listings.updateById(createdListing.id, {
          images_json: photosUrl
        });
      }
      */

      // todo: remove this block once the new functionality is tested
      if (listingData.images.length > 0) {
        let i = 0;
        for await (const image of listingData.images) {
          const imageUrl = await this.uploadImage(createdListing, image, i++);
          images.push(imageUrl);
        }
        await this.listings.updateById(createdListing.id, {images: images});
      }

      res
        .status(STATUS_CODES.CREATED)
        .json({data: {id: createdListing.id}, message: 'created'});
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
      const currentUser: User = req.user;

      const listingToUpdate: any = await this.listings.findById(id);
      if (!listingToUpdate) {
        throw listingNotFoundException('Listing not found');
      }

      if (listingToUpdate.user.id !== currentUser.id) {
        throw listingUnathorizedException('Insufficient Permissions');
      }
      updateData.images = await this.checkPhotosByMetadata(
        listingToUpdate,
        updateData
      );

      await this.listings.updateById(id, updateData);
      // if (listingToUpdate.listing_status.id === LISTING_STATUS.FLAGGED) {
      //   await this.listingsFlag.updateNewChanges(id, true);
      // }

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
      const currentUser: User = req.user;

      const listingToDelete: any = await this.listings.findById(id);
      if (!listingToDelete) {
        throw listingNotFoundException('Listing not found');
      }

      if (listingToDelete.user.id !== currentUser.id) {
        throw listingUnathorizedException('Insufficient Permissions');
      }

      await this.listings.updateById(id, {
        highlighted: false,
        status_id: LISTING_STATUS.INACTIVE,
        deleted_at: getISONow()
      });
      await this.bookmarks.deleteByListing(id);

      res.status(STATUS_CODES.OK).json({message: 'deleted'});
    } catch (error) {
      next(error);
    }
  };

  public publishListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const currentUser: User = req.user;

      const listingToPublish: any = await this.listings.findById(id);
      if (!listingToPublish) {
        throw listingNotFoundException('Listing not found');
      }

      if (listingToPublish.user.id !== currentUser.id) {
        throw listingUnathorizedException('Insufficient Permissions');
      }

      if (
        listingToPublish.listing_status.id !== LISTING_STATUS.DRAFT &&
        listingToPublish.listing_status.id !== LISTING_STATUS.INACTIVE
      ) {
        throw listingCantPublishException('You cannot publish the listing');
      }

      if (!listingToPublish.listing_packages) {
        throw listingWithoutActivePackageException(
          'The listing does not have an active package assigned'
        );
      }

      let activePackage = false;
      for (let i = 0; i < listingToPublish.listing_packages.length; ++i) {
        if (listingToPublish.listing_packages[i].active) {
          activePackage = true;
          break;
        }
      }

      if (!activePackage) {
        throw listingWithoutActivePackageException(
          'The listing does not have an active package assigned'
        );
      }

      await this.listings.updateById(id, {
        status_id: LISTING_STATUS.ACTIVE,
        selected_packages: {}
      });

      res.status(STATUS_CODES.OK).json({message: 'Listing published'});
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
      const currentUser: User = req.user;
      const promoteData = req.body;

      const listingToPromote: any = await this.listings.findById(id);
      if (!listingToPromote) {
        throw listingNotFoundException('Listing not found');
      }

      if (listingToPromote.user.id !== currentUser.id) {
        throw listingUnathorizedException('Insufficient Permissions');
      }

      const listingPackage = await this.listingsPackages.findActivePackage(id);
      await this.listingsPackages.promoteById(
        listingPackage.id,
        promoteData.promote_package_id,
        req.user.id
      );

      res.status(STATUS_CODES.OK).json({message: 'Listing promoted'});
    } catch (error) {
      next(error);
    }
  };

  public reportListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const user = req.user;
      const report = req.body;

      const listingToReport: any = await this.listings.findById(id);
      if (!listingToReport) {
        throw listingNotFoundException('Listing not found');
      }

      const existingReports = await this.flagReport.findByUserId(user.id);
      const alreadyReported = !!existingReports.find(
        (i) => i.listing_id === id
      );

      await this.flagReport.create({
        user_id: user.id,
        listing_id: id,
        reason_id: report.reason_id,
        comment: report.comment || ''
      } as any);

      const admins = await this.users.findAdmins();
      let notification: any;
      if (admins.length && NOTIFICATION_ENABLED && !alreadyReported) {
        for (const admin of admins) {
          notification = {
            user_id: admin.id,
            scope: UserRoles.ADMIN,
            type: NOTIFICATION_TYPE.LISTING_REPORTED,
            seen: false,
            message: `Listing "${listingToReport.title}" has been reported`
          };
          await this.notifications.create(notification as any);
          if (MAILER_ENABLED) {
            const card = {
              title: listingToReport.title,
              category: `${listingToReport.subcategory.category.name} > ${listingToReport.subcategory.name}`,
              vendor: listingToReport.user.full_name,
              link: `${FE_URL}/listing-detail/${listingToReport.id}`
            };
            const redirectUrl = `${FE_URL}/${FE_ADMIN_FLAGGED}`;
            const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
            await this.sendgrid.listingReported(
              admin.email,
              card,
              redirectUrl,
              unsubscribe
            );
          }
        }
        notifications.listingReported(notification);
      }

      res.status(STATUS_CODES.OK).json({message: 'Listing reported'});
    } catch (error) {
      next(error);
    }
  };

  public isReportedListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const user = req.user;
      let reported = false;

      const listingToReport: any = await this.listings.findById(id);
      if (!listingToReport) {
        throw listingNotFoundException('Listing not found');
      }
      const existingReports = await this.flagReport.findByUserId(user.id);
      const alreadyReported = existingReports.find((i) => i.listing_id === id);
      if (alreadyReported) {
        reported = true;
      }

      res.status(STATUS_CODES.OK).json({
        data: {reported},
        message: 'Listing is reported'
      });
    } catch (error) {
      next(error);
    }
  };

  private uploadPhotos = async (
    listingId: number,
    photos: string[]
  ): Promise<any[]> => {
    const photosUrl = [];
    if (photos) {
      let nphotos = 0;
      const imgFmt = ImageFormat.webp;
      for (const photo of photos) {
        this.imageManip.setImage(
          Buffer.from(photo.replace(/^data:image\/\w+;base64,/, ''), 'base64')
        );
        await this.imageManip.convert(imgFmt);
        await this.imageManip.resize([
          {width: 382, height: 205},
          {width: 790, height: 422}
        ]);
        const processed = this.imageManip.getProcessed();
        const resized = processed.resized;

        const sizesToUpload = [];
        for (let i = 0; i < resized.length; ++i) {
          sizesToUpload.push(
            this.s3.upload(
              './',
              `listing_img_${listingId}_${nphotos}${i}_${resized[i].size}_${imgFmt}_${ENV}`,
              resized[i].image,
              {
                contentEncoding: 'base64',
                contentType: imgFmt
              }
            )
          );
        }
        photosUrl.push(
          (await Promise.all(sizesToUpload)).reduce(
            (prev, curr, idx) => ({
              ...prev,
              [resized[idx].size]: curr
            }),
            {}
          )
        );
        ++nphotos;
      }
    }
    return photosUrl;
  };

  private checkPhotos = async (
    listing: Partial<Listing>,
    updateListingData: Partial<Listing>
  ): Promise<string[]> => {
    const base64Images = [];
    let newImages = [];
    const updateImages = updateListingData.images;
    //get all photos from s3 and convert it to base64
    for await (const image of listing.images) {
      const getImage = await axios.get(image, {
        responseType: 'arraybuffer'
      });
      base64Images.push(Buffer.from(getImage.data).toString('base64'));
    }
    //compare every image if it's in the incoming update Data
    let i = 0;
    for await (let updateImage of updateImages) {
      const indexUpdateImage = updateImages.indexOf(updateImage);
      updateImage = updateImage.replace(/^data:image\/\w+;base64,/, '');
      //add image into new array if it doesn't exist already
      if (!base64Images.includes(updateImage)) {
        const imageUrl = await this.uploadImage(listing, updateImage, i++);
        newImages.push(imageUrl);
      }

      //if it's included, check the position into the array of image
      if (base64Images.includes(updateImage)) {
        const indexImage = base64Images.indexOf(updateImage);
        //if the position doesn't match, change it in the new array
        if (indexImage !== indexUpdateImage) {
          if (newImages[indexUpdateImage] === null) {
            newImages[indexUpdateImage] = listing.images[indexImage];
          }
        }
      }
    }

    //check if any images were deleted
    for await (const updateImage of updateImages) {
      const indexUpdateImage = updateImages.indexOf(updateImage);
      updateImages[indexUpdateImage] = updateImage.replace(
        /^data:image\/\w+;base64,/,
        ''
      );
    }
    for await (const oldImage of base64Images) {
      const oldIndex = base64Images.indexOf(oldImage);
      if (!updateImages.includes(oldImage)) {
        await this.s3.remove(listing.images[oldIndex]);
      }
    }

    //if any image was changed, then copy the old array of images in the new one
    if (newImages.length === 0 && updateImages.length > 0) {
      newImages = listing.images;
    }
    return newImages;
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
        const imageUrl = await this.uploadImage(listing, image.data, i++);
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
    listing: Partial<Listing>,
    image: string,
    idx: number
  ): Promise<string> => {
    const imgFmt = ImageFormat.webp;
    this.imageManip.setImage(
      Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    );
    await this.imageManip.convert(imgFmt);
    const processed = this.imageManip.getProcessed();
    const url = await this.s3.upload(
      `${ENV}/${listing.user_id}/${LISTING_PATH}/${listing.id}/`,
      `static_${idx}`,
      processed.converted,
      {
        contentEncoding: 'base64',
        contentType: imgFmt
      }
    );
    return url;
  };

  public downloadCsvListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dir = './temp';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      const listingsCsv: any = await this.listings.findCsv();
      const file = Buffer.from(listingsCsv);
      await fs.writeFileSync(`${dir}/Desilsit Listings Information.csv`, file);
      const stream = fs.createReadStream(
        `${dir}/Desilsit Listings Information.csv`
      );
      res.set({
        'Content-Disposition': `attachment; filename='Desilsit Listings Information.csv'`,
        'Content-Type': 'text/csv'
      });
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  };

  public shareListingById = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const findListing: any = await this.listings.findById(id);
      if (!findListing) {
        throw listingNotFoundException('Listing not found');
      }

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

      if (isbot(req.get('user-agent'))) {
        res.status(STATUS_CODES.OK).send(`
        <html>
          <head>
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Desilist" />
            <meta property="og:url" content="${
              config.frontend.url
            }/api/listings/${id}/share" />
            <meta property="og:title" content="${findListing?.title}" />
            <meta property="og:description" content="${findListing?.description?.substring(
              0,
              50
            )}" />
            <meta property="og:image" content="${
              findListing?.images?.[0]
                ? findListing?.images?.[0]?.url
                : 'https://desilist.com/static/media/ListingPlaceholderChico.6840235fcd2c6323f859.webp'
            }"/>
            <meta property="og:image:type" content="image/webp" />
            <meta property="og:image:width" content="400"/>
            <meta property="og:image:height" content="300"/>
          </head>
          <body></body>
        </html>`);
      } else {
        res.redirect(
          STATUS_CODES.MOVED_PERMANENTLY,
          `${config.frontend.url}/listing-detail/${id}`
        );
      }
    } catch (error) {
      next(error);
    }
  };

  public updateFlaggedListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const updateData: UpdateListingDto = req.body;
      const currentUser: User = req.user;

      const listingToUpdate: any = await this.listings.findById(id);
      if (!listingToUpdate) {
        throw listingNotFoundException('Listing not found');
      }

      if (listingToUpdate.user.id !== currentUser.id) {
        throw listingUnathorizedException('Insufficient Permissions');
      }
      updateData.images = await this.checkPhotosByMetadata(
        listingToUpdate,
        updateData
      );

      await this.listings.updateById(id, updateData);
      if (listingToUpdate.listing_status.id === LISTING_STATUS.FLAGGED) {
        await this.listingsFlag.updateNewChanges(id, true);
      }

      const admins = await this.users.findAdmins();
      if (admins.length) {
        for (const admin of admins) {
          if (MAILER_ENABLED) {
            const card = {
              title: listingToUpdate.title,
              category: `${listingToUpdate.subcategory.category.name} > ${listingToUpdate.subcategory.name}`,
              vendor: listingToUpdate.user.full_name,
              link: `${FE_URL}/listing-detail/${listingToUpdate.id}`
            };
            const redirectUrl = `${FE_URL}/${FE_ADMIN_FLAGGED}`;
            const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
            await this.sendgrid.listingFlaggedUpdated(
              admin.email,
              card,
              redirectUrl,
              unsubscribe
            );
          }
        }
      }

      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };
}

export default ListingsController;
