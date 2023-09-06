import {NextFunction, Request, Response} from 'express';
import {User} from '@prisma/client';
import {STATUS_CODES} from '@constants/statusCodes';
import {
  UserService,
  LocationService,
  PasswordService,
  ListingService,
  ChatService,
  BannerService,
  BookmarkService,
  StripeService,
  CustomerService
} from '@/services';
import {AdminUserService} from '@/services';
import {userNotFoundException} from '@/errors/users.error';
import {diffToNowForHumans} from '@/utils/time';
import {UpdateUserDto} from '@dtos/users.dto';
import {UserRoles} from '@/constants';
import {genericErrorException} from '@/errors/generics.erros';
import {GetAllUsers} from '@/interfaces/users.interface';
import {NotificationService} from '@/services/notification.service';
import config from '@/config';
import {PAYMENT_METHOD_TYPE} from '@/constants/payments';
import {ChatMessageService} from '@/services/chatsMessages.service';
import {SendGridService} from '../../services/sendgrid.service';

const STRIPE_API_KEY = config.payment_gateway.stripe.api_key;
const FE_URL = config.frontend.url;
const FE_UNSUSCRIBE_ENDP = config.frontend.endpoints.unsuscribe;

class AdminUsersController {
  public users = new UserService();
  public adminUsers = new AdminUserService();
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
  private sendgrid = new SendGridService();

  public getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params = req.query;
      const usersData: Partial<GetAllUsers> = await this.adminUsers.find(
        params
      );

      res.status(STATUS_CODES.OK).json({data: usersData, message: 'findAll'});
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = String(req.params.id);
      // fix: create new service to retrieve all user data
      const findUser: Partial<User> = await this.users.findById(userId);
      if (!findUser) {
        throw userNotFoundException('User not found');
      }

      const memberSince = diffToNowForHumans(findUser.created_at);

      const data = {
        id: findUser.id,
        full_name: findUser.full_name,
        email: findUser.email,
        phone_number: findUser.phone_number,
        bio: findUser.bio,
        photo: findUser.photo,
        member_since: memberSince
      };

      res.status(STATUS_CODES.OK).json({data: data, message: 'findOne'});
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.params.id;
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
        photo: updateData.photo,
        bio: updateData.bio,
        alternative_email: updateData.alternative_email
      };

      const locationId = await this.locations.findByUserId(userId);
      const updateUser = this.users.updateById(userId, updateUserData);
      const updateLocation = this.locations.updateById(
        locationId[0].id,
        updateLocationData
      );

      await Promise.all([updateLocation, updateUser]);

      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.params.id;
      const user = await this.users.findById(userId);

      if (!user) {
        throw userNotFoundException('User not found');
      }

      if (user.role_id === UserRoles.ADMIN) {
        throw genericErrorException('This account cannot be deleted.');
      }

      await this.deleteUserResources(userId);
      await this.users.deleteById(userId);

      const redirectUrl = `${FE_URL}/contact-us`;
      const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
      await this.sendgrid.accountDeleted(
        user.email,
        user.full_name,
        redirectUrl,
        unsubscribe
      );

      res.status(STATUS_CODES.OK).json({message: 'deleted'});
    } catch (error) {
      next(error);
    }
  };

  public disableUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.params.id;
      const user = await this.users.findById(userId);

      if (!user) {
        throw userNotFoundException('User not found');
      }

      if (user.role_id === UserRoles.ADMIN) {
        throw genericErrorException('This account cannot be disabled.');
      }

      await this.deleteUserResources(userId);
      await this.users.disableById(userId);

      res.status(STATUS_CODES.OK).json({message: 'User disabled'});
    } catch (error) {
      next(error);
    }
  };

  private deleteUserResources = async (userId: string): Promise<void> => {
    const chats = await this.chats.findByUser(userId);
    const listings = await this.listings.findByUserForDelete(userId);
    await this.listings.deleteByUserId(userId);
    await this.bookmarks.deleteByUser(userId);
    for (const chat of chats) {
      await this.chatMessages.deleteByChat(chat.id);
    }
    for (const listing of listings) {
      await this.bookmarks.deleteByListing(listing.id);
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

export default AdminUsersController;
