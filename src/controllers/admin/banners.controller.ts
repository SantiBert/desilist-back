import {NextFunction, Request, Response} from 'express';
import {User} from '@prisma/client';
import {STATUS_CODES, UserRoles} from '@/constants';
import {BannerService} from '@/services/admin/banners.service';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {getISONow} from '@/utils/time';
import {S3} from '@/services';
import config from '@/config';
import {GetAllBanner} from '@/interfaces/banner.interface';
import {CreateBannerDto, UpdateBannerDto} from '../../dtos/banners.dto';
import {CategoryService} from '../../services/categories.service';
import {
  bannerTooManyImagesException,
  bannerNotFoundException,
  bannerUnathorizedException
} from '../../errors/banners.error';
import {BannerSource, BannerType} from '@/constants/banners';
import {ImageFormat, ImageManip} from '@/utils/imageManip';

const S3_BUCKET = config.aws.s3.bucket;
const S3_ACCESS_KEY_ID = config.aws.s3.access_key_id;
const S3_SECRET_ACCESS_KEY = config.aws.s3.secret_access_key;
const BANNER_PATH = 'Assets/Advertising';
const BANNER_FOR_ALL_CATEGORIES = 99;
const ENV = config.environment;

class BannersController {
  public banners = new BannerService();
  public categories = new CategoryService();
  public s3 = new S3(S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY);
  public imageManip = new ImageManip();
  private MAX_NUMBER_FILES = 6;

  public getBannersAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params = req.query;
      const bannersData: Partial<GetAllBanner> = await this.banners.findAdmin(
        params
      );

      const {banners, total, cursor, pages} = bannersData;

      res.status(STATUS_CODES.OK).json({
        data: {banners, total, cursor, pages},
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };

  public getBanners = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params = req.query;
      const bannersData: Partial<GetAllBanner> = await this.banners.find(
        params
      );

      const {banners, total, cursor, pages} = bannersData;

      res.status(STATUS_CODES.OK).json({
        data: {banners, total, cursor, pages},
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };

  public createBanner = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const bannerData: CreateBannerDto = req.body;
      bannerData.source as unknown as BannerSource[];
      bannerData.banner_type as unknown as BannerType[];
      const user: User = req.user;
      const imageDesktop = [];
      const imageMobile = [];
      const data = {
        ...bannerData,
        user_id: user.id
      };

      if (
        (bannerData.desktop_image.length || bannerData.mobile_image.length) >
        this.MAX_NUMBER_FILES
      ) {
        throw bannerTooManyImagesException('Too many files');
      }

      const type = bannerData.banner_type.split('_');
      const bannerType = `
        ${type[0].charAt(0).toUpperCase()}${type[0].slice(1)}
        ${type[1].charAt(0).toUpperCase()}${type[1].slice(1)}`;

      if (
        bannerData.source === BannerSource.CATEGORIES &&
        bannerData.category_id === BANNER_FOR_ALL_CATEGORIES
      ) {
        for await (const categories of await this.categories.getAll()) {
          bannerData.category_id = categories.id;
          const data = {
            ...bannerData
          };
          const createdBanner = await this.banners.create(data as any);
          if (!createdBanner) {
            throw new Error('Server Error');
          }

          if (bannerData.desktop_image.length > 0) {
            for await (const image of bannerData.desktop_image) {
              const imageUrl = await this.uploadImage(
                image,
                `${ENV}/${BANNER_PATH}/${createdBanner.category_id}/Desktop/${bannerType}/`,
                createdBanner.id.toString()
              );
              imageDesktop.push(imageUrl);
            }
            await this.banners.updateById(createdBanner.id, {
              desktop_image: imageDesktop
            });
          }

          if (bannerData.mobile_image.length > 0) {
            for await (const image of bannerData.mobile_image) {
              const imageUrl = await this.uploadImage(
                image,
                `${ENV}/${BANNER_PATH}/${createdBanner.category_id}/Mobile/${bannerType}/`,
                createdBanner.id.toString()
              );
              imageMobile.push(imageUrl);
            }
            await this.banners.updateById(createdBanner.id, {
              mobile_image: imageMobile
            });
          }
        }
      } else {
        const createdBanner = await this.banners.create(data as any);
        if (!createdBanner) {
          throw new Error('Server Error');
        }

        if (bannerData.desktop_image.length > 0) {
          for await (const image of bannerData.desktop_image) {
            const imageUrl = await this.uploadImage(
              image,
              `${ENV}/${BANNER_PATH}/Landing/${createdBanner.category_id}/Desktop/${bannerType}/`,
              createdBanner.id.toString()
            );
            imageDesktop.push(imageUrl);
          }
          await this.banners.updateById(createdBanner.id, {
            desktop_image: imageDesktop
          });
        }

        if (bannerData.mobile_image.length > 0) {
          for await (const image of bannerData.mobile_image) {
            const imageUrl = await this.uploadImage(
              image,
              `${ENV}/${BANNER_PATH}/Landing/${createdBanner.category_id}/Mobile/${bannerType}/`,
              createdBanner.id.toString()
            );
            imageMobile.push(imageUrl);
          }
          await this.banners.updateById(createdBanner.id, {
            mobile_image: imageMobile
          });
        }
      }

      res.status(STATUS_CODES.CREATED).json({message: 'created'});
    } catch (error) {
      next(error);
    }
  };

  public updateBanner = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const updateData: UpdateBannerDto = req.body;
      updateData.source as unknown as BannerSource[];
      updateData.banner_type as unknown as BannerType[];
      const currentUser: User = req.user;

      const bannerToUpdate = await this.banners.findById(id);
      if (!bannerToUpdate) {
        throw bannerNotFoundException('Banner not found');
      }

      if (currentUser.role_id !== UserRoles.ADMIN) {
        throw bannerUnathorizedException('Insufficient Permissions');
      }

      await this.banners.updateById(id, updateData);

      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };

  public deleteBanner = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const currentUser: User = req.user;

      const bannerToDelete: any = await this.banners.findById(id);
      if (!bannerToDelete) {
        throw bannerNotFoundException('Banner not found');
      }

      if (currentUser.role_id !== UserRoles.ADMIN) {
        throw bannerUnathorizedException('Insufficient Permissions');
      }

      await this.banners.updateById(id, {
        deleted_at: getISONow()
      });

      res.status(STATUS_CODES.OK).json({message: 'deleted'});
    } catch (error) {
      next(error);
    }
  };

  public pausedBanner = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const currentUser: User = req.user;

      const bannerToPaused: any = await this.banners.findById(id);
      if (!bannerToPaused) {
        throw bannerNotFoundException('Banner not found');
      }

      if (currentUser.role_id !== UserRoles.ADMIN) {
        throw bannerUnathorizedException('Insufficient Permissions');
      }

      if (!bannerToPaused.paused) {
        await this.banners.updateById(id, {
          paused: true
        });
      } else {
        await this.banners.updateById(id, {
          paused: false
        });
      }

      res.status(STATUS_CODES.OK).json({message: 'Banner paused'});
    } catch (error) {
      next(error);
    }
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

export default BannersController;
