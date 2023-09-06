import {NextFunction, Response} from 'express';
import {STATUS_CODES} from '@constants/statusCodes';
import {
  UserService,
  LocationService,
  PasswordService,
  ListingService,
  BannerService,
  ChatService,
  BookmarkService,
  StripeService,
  CustomerService,
  SessionService
} from '@/services';
import {userNotFoundException} from '@/errors/users.error';
import {diffToNowForHumans} from '@/utils/time';
import {
  ChangeUserPasswordDto,
  DeleteUserDto,
  DisableUserDto,
  UpdateUserDto
} from '@dtos/users.dto';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {genericErrorException} from '@/errors/generics.erros';
import {UserRoles} from '@/constants';
import {NotificationService} from '@/services/notification.service';
import config from '@/config';
import {PAYMENT_METHOD_TYPE} from '@/constants/payments';
import {ChatMessageService} from '@/services/chatsMessages.service';
import {ImageManip, ImageFormat} from '@/utils/imageManip';
import {S3} from '@/services';

const STRIPE_API_KEY = config.payment_gateway.stripe.api_key;
const S3_BUCKET = config.aws.s3.bucket;
const S3_ACCESS_KEY_ID = config.aws.s3.access_key_id;
const S3_SECRET_ACCESS_KEY = config.aws.s3.secret_access_key;
const AVATAR_PATH = 'Avatar';
const ENV = config.environment;
class UsersController {
  public users = new UserService();
  public passwords = new PasswordService();
  public listings = new ListingService();
  public locations = new LocationService();
  public notifications = new NotificationService();
  public chats = new ChatService();
  public chatMessages = new ChatMessageService();
  public banners = new BannerService();
  public bookmarks = new BookmarkService();
  public stripe = new StripeService(STRIPE_API_KEY, {apiVersion: '2020-08-27'});
  public customers = new CustomerService();
  public imageManip = new ImageManip();
  public s3 = new S3(S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY);
  public session = new SessionService();

  public getUserById = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = String(req.params.id);
      // fix: create new service to retrieve all user data
      const findUser: any = await this.users.findById(userId);

      if (!findUser) {
        throw userNotFoundException('User not found');
      }

      const memberSince = diffToNowForHumans(findUser.created_at);

      const data = {
        id: findUser.id,
        full_name: findUser.full_name,
        email: findUser.email,
        phone_number: findUser.phone_number,
        location: findUser.location,
        listing_count: findUser.listings.length,
        bio: findUser.bio,
        photo: findUser.photo,
        photo_json: findUser.photo_json,
        member_since: memberSince
      };

      if (!req.user) {
        data.email = data.email.replace(/./g, '*');
        data.phone_number = data.phone_number
          ? data.phone_number.replace(/./g, '*')
          : null;
      }

      res.status(STATUS_CODES.OK).json({data: data, message: 'findOne'});
    } catch (error) {
      next(error);
    }
  };

  public getCurrentUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      res
        .status(STATUS_CODES.OK)
        .json({data: req.user, message: 'Current user'});
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const updateData: UpdateUserDto = req.body;

      const updateLocationData = {
        country: updateData.country,
        zip_code: updateData.zip_code,
        city: updateData.city,
        state: updateData.state
      };

      const updateUserData = {
        full_name: updateData.full_name,
        phone_number: updateData.phone_number,
        // photo: updateData.photo,
        bio: updateData.bio,
        alternative_email: updateData.alternative_email
      };

      const locationId = await this.locations.findByUserId(userId);
      const updateUser = this.users.updateById(userId, updateUserData);
      const updateLocation = this.locations.updateById(
        locationId[0].id,
        updateLocationData
      );
      // new flow
      if (updateData.photo && updateData.photo.includes('data:image')) {
        const imgFmt = ImageFormat.webp;
        this.imageManip.setImage(
          Buffer.from(
            updateData.photo.replace(/^data:image\/\w+;base64,/, ''),
            'base64'
          )
        );
        await this.imageManip.convert(imgFmt);
        await this.imageManip.resize([
          {width: 32, height: 32},
          {width: 128, height: 128}
        ]);
        const processed = this.imageManip.getProcessed();
        const resized = processed.resized;

        const sizesToUpload = [];
        for (let i = 0; i < resized.length; ++i) {
          sizesToUpload.push(
            this.s3.upload(
              `${ENV}/${userId}/${AVATAR_PATH}/`,
              resized[i].size,
              resized[i].image,
              {
                contentEncoding: 'base64',
                contentType: imgFmt
              }
            )
          );
        }
        const imgUrls = await Promise.all(sizesToUpload);
        await this.users.updateById(userId, {
          photo_json: {
            [resized[0].size]: imgUrls[0],
            [resized[1].size]: imgUrls[1]
          }
        });
      }

      await Promise.all([updateLocation, updateUser]);

      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      const deleteData: DeleteUserDto = req.body;

      if (!user) {
        throw userNotFoundException('User not found');
      }

      if (user.role_id === UserRoles.ADMIN) {
        throw genericErrorException('Your account cannot be deleted.');
      }

      const isPasswordMatching = await this.passwords.isPasswordMatching(
        user,
        deleteData.password
      );
      if (!isPasswordMatching) {
        throw genericErrorException('An error ocurred during operation.');
      }

      await this.deleteUserResources(user.id);
      await this.users.deleteById(user.id);

      res.status(STATUS_CODES.OK).json({message: 'deleted'});
    } catch (error) {
      next(error);
    }
  };

  public disableUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      const disableData: DisableUserDto = req.body;

      if (!user) {
        throw userNotFoundException('User not found');
      }

      if (user.role_id === UserRoles.ADMIN) {
        throw genericErrorException('Your account cannot be disabled.');
      }

      const isPasswordMatching = await this.passwords.isPasswordMatching(
        user,
        disableData.password
      );
      if (!isPasswordMatching) {
        throw genericErrorException('An error ocurred during operation.');
      }

      await this.deleteUserResources(user.id);
      await this.users.disableById(user.id);

      res.status(STATUS_CODES.OK).json({message: 'User disabled'});
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      const updateData: ChangeUserPasswordDto = req.body;

      const isPasswordMatching = await this.passwords.isPasswordMatching(
        user,
        updateData.password
      );
      if (!isPasswordMatching) {
        throw genericErrorException('An error ocurred during operation.');
      }

      const updatePasswordData = {
        hash: await this.passwords.hashPassword(updateData.new_password)
      };

      const passwordChanged = await this.passwords.updateByUserId(
        user.id,
        updatePasswordData
      );
      if (passwordChanged) {
        await this.session.deleteManyByUserId(user.id);
      }

      res.status(STATUS_CODES.OK).json({message: 'password changed'});
    } catch (error) {
      next(error);
    }
  };

  public getUnreadNotifications = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;

      const notifications =
        await this.notifications.findUnreadNotificationByUserId(user.id);

      res
        .status(STATUS_CODES.OK)
        .json({data: notifications, message: 'Notifications retrieved'});
    } catch (error) {
      next(error);
    }
  };

  private deleteUserResources = async (userId: string): Promise<void> => {
    const chats = await this.chats.findByUser(userId);
    await this.listings.deleteByUserId(userId);
    await this.banners.deleteByUserId(userId);
    await this.bookmarks.deleteByUser(userId);
    for (const chat of chats) {
      await this.chatMessages.deleteByChat(chat.id);
    }
    await this.chats.deleteByUserId(userId);
    await this.notifications.deleteByUserId(userId);
    const customer = await this.customers.findCustomerByUser(userId);
    if (customer) {
      const paymentMethods = await this.stripe.getPaymentMethod(
        customer.customer_id,
        PAYMENT_METHOD_TYPE.CARD
      );
      for (const paymentMethod of paymentMethods) {
        await this.stripe.detachPaymentMethod(paymentMethod.id);
      }
    }
  };
}

export default UsersController;
