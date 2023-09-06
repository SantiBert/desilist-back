import {NextFunction, Request, Response} from 'express';
import {
  ActivateAccountDto,
  ChangePasswordEmailDto,
  ChangePasswordSMSDto,
  EnableAccountDto,
  LogInDto,
  ResendActivateAccountEmailDto,
  ResendResetPasswordEmailDto,
  ResendResetPasswordSMSDto,
  ResetPasswordEmailDto,
  ResetPasswordSMSDto,
  ResetPasswordVerifyDto,
  SignupDto,
  ValidateEmailDto,
  ValidateOTPDto
} from '@dtos/auth.dto';
import {RequestWithUser} from '@interfaces/auth.interface';
import {STATUS_CODES} from '@constants/statusCodes';
import {User} from '@prisma/client';
import {
  AuthService,
  LocationService,
  OTPService,
  PasswordService,
  SessionService,
  UserService,
  UserPreferenceService,
  ValidationService,
  SendGridService,
  TwilioService
} from '@/services';
import {
  userAlreadyActivatedException,
  userAlreadyExistsException,
  userDisabledException,
  userOrPasswordWrongException,
  userPendingVerificationException
} from '@/errors/users.error';
import {
  genericErrorException,
  otpExpiredException
} from '@/errors/generics.erros';
import {UserRoles, UserStatus} from '@/constants/user.constants';
import {checkUserLoginGuard} from '@/guards/users.guard';
import {
  invalidTokenException,
  missingRefreshTokenException,
  wrongRefreshTokenException
} from '@/errors/auth.error';
import {getISONow, getUniversalTime} from '@/utils/time';
import {S3} from '@/services';
import config from '@/config';
// import notifications from '@/notifications';
import {NotificationService} from '@/services/notification.service';
import {hasNullProp} from '@/utils/util';
import {NOTIFICATION_TYPE} from '@/constants/notifications';
import {ListingService} from '../services/listings.services';
import {BannerService} from '../services/admin/banners.service';
import {ChatMessageService} from '../services/chatsMessages.service';
import {ChatService} from '../services/chats.service';
import {ImageFormat, ImageManip} from '@/utils/imageManip';
// import {NOTIFICATION_TYPE} from '@/constants/notifications';

const S3_BUCKET = config.aws.s3.bucket;
const S3_ACCESS_KEY_ID = config.aws.s3.access_key_id;
const S3_SECRET_ACCESS_KEY = config.aws.s3.secret_access_key;
const MAILER_ENABLED = config.mailer.enabled;
const AVATAR_PATH = 'Avatar';
const ENV = config.environment;
// fix: remove this var
// const NOTIFICATION_ENABLED = config.notification_service.enabled;

const enum SignupFlow {
  CREATE = 'create',
  UPDATE = 'update'
}
const $UserIncomplete = {
  title: 'Complete your Account information',
  message:
    'Complete your profile to improve your engagement with future clients and vendors.'
};
class AuthController {
  public auth = new AuthService();
  public location = new LocationService();
  public otp = new OTPService();
  public password = new PasswordService();
  public session = new SessionService();
  public users = new UserService();
  public userPreferences = new UserPreferenceService();
  public validation = new ValidationService();
  // fix: change property to private, actually public for testing purposes
  public s3 = new S3(S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY);
  public imageManip = new ImageManip();
  private sendgrid = new SendGridService();
  private twilio = new TwilioService();
  public listings = new ListingService();
  private notifications = new NotificationService();
  public chats = new ChatService();
  public chatMessages = new ChatMessageService();
  public banners = new BannerService();

  public signUp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: SignupDto = req.body;
      let flow = SignupFlow.CREATE;
      const findUser = await this.users.findByEmail(userData.email);
      if (findUser) {
        if (!findUser.deleted_at) {
          throw userAlreadyExistsException(
            `The email ${userData.email} already exists`
          );
        }
        flow = SignupFlow.UPDATE;
      }

      const createUserData: any = {
        email: userData.email,
        full_name: userData.full_name,
        phone_number: userData.phone_number,
        photo: null,
        photo_json: {}, // todo: remove this prop
        bio: userData.bio,
        role: {connect: {id: UserRoles.USER}},
        status: {connect: {id: UserStatus.PENDING_VERIFICATION}}
      };

      const createdUserData =
        flow === SignupFlow.CREATE
          ? await this.users.create(createUserData)
          : await this.users.updateById(findUser.id, createUserData);

      // new flow
      if (userData.photo) {
        const imgFmt = ImageFormat.webp;
        this.imageManip.setImage(
          Buffer.from(
            userData.photo.replace(/^data:image\/\w+;base64,/, ''),
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
              `${ENV}/${createdUserData.id}/${AVATAR_PATH}/`,
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
        await this.users.updateById(createdUserData.id, {
          photo_json: {
            [resized[0].size]: imgUrls[0],
            [resized[1].size]: imgUrls[1]
          }
        });
      }

      // todo: remove this block once new flow is tested
      /*
      if (userData.photo) {
        const imageUrl = await this.s3.upload(
          `${ENV}/${createdUserData.id}/${AVATAR_PATH}/`,
          'static',
          Buffer.from(
            userData.photo.replace(/^data:image\/\w+;base64,/, ''),
            'base64'
          ),
          {
            contentEncoding: 'base64',
            contentType: userData.photo.split(';')[0].split('/')[1]
          }
        );
        await this.users.updateById(createdUserData.id, {photo: imageUrl});
      }
      */

      const createPasswordData: any =
        flow === SignupFlow.CREATE
          ? {
              hash: await this.auth.hashPassword(userData.password),
              user: {connect: {id: createdUserData.id}}
            }
          : {
              hash: await this.auth.hashPassword(userData.password)
            };

      const createPreferencesData: any = {
        user_id: createdUserData.id,
        unsubscribed: {}
      };

      const createLocationData: any = {
        country: userData.country,
        zip_code: userData.zip_code,
        city: userData.city,
        state: userData.state,
        user: {connect: {id: createdUserData.id}}
      };

      if (flow === SignupFlow.UPDATE) {
        await this.validation.deleteIfUserHas(findUser.id);
      }

      const [createdValidation] = await Promise.all([
        this.validation.create(createdUserData.id),
        flow === SignupFlow.CREATE
          ? this.password.create(createPasswordData)
          : this.password.updateByUserId(findUser.id, createPasswordData),
        flow === SignupFlow.CREATE
          ? this.userPreferences.create(createPreferencesData)
          : async (): Promise<void> => {
              /* if user is reactivated we should not change old preferences */
            },
        flow === SignupFlow.CREATE
          ? this.location.create(createLocationData)
          : this.location.updateByUserId(findUser.id, createLocationData)
      ]);

      if (MAILER_ENABLED) {
        await this.sendgrid.activateAccount(
          createdUserData.email,
          createdValidation.token
        );
      }

      if (flow === SignupFlow.UPDATE) {
        await this.users.updateById(createdUserData.id, {
          deleted_at: null,
          created_at: getISONow()
        });
      }

      res.status(STATUS_CODES.CREATED).json({
        data: createdUserData,
        message:
          'A link to activate your account has been emailed to the address provided.'
      });
    } catch (error) {
      next(error);
    }
  };

  public activateAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: ActivateAccountDto = req.body;
      const isTokenValid = await this.validation.isTokenValid(userData.hash);
      if (!isTokenValid) {
        throw invalidTokenException('Error activating account');
      }

      const validationData = await this.validation.findByToken(userData.hash);
      await this.validation.deleteByUserId(validationData.user_id);

      const findUser = await this.users.findById(validationData.user_id);

      if (findUser.status_id !== UserStatus.PENDING_VERIFICATION) {
        throw userAlreadyActivatedException('Error activating account');
      }

      this.users.updateById(validationData.user_id, {
        status_id: UserStatus.ACTIVE
      });

      res.status(STATUS_CODES.OK).json({
        data: {id: validationData.user_id},
        message: 'Account has been activated'
      });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // always call isPasswordMatching for comparison even though the user do not exists to prevent timing attacks
      const userData: LogInDto = req.body;
      const findUser: any = await this.users.findByEmail(userData.email);
      const isPasswordMatching = await this.password.isPasswordMatching(
        findUser,
        userData.password
      );
      if (
        !findUser ||
        (await this.users.isUserDeleted(userData.email)) ||
        !isPasswordMatching
      ) {
        throw userOrPasswordWrongException('Invalid user or password.');
      }

      if (findUser.status_id === UserStatus.PENDING_VERIFICATION) {
        const validationData = await this.validation.findByUserId(findUser.id);
        const isTokenValid = await this.validation.isTokenValid(
          validationData ? validationData.token : ''
        );
        if (isTokenValid) {
          throw userPendingVerificationException(
            'You need to activate your account before login. Please check your email address for a confirmation email.'
          );
        }
        await this.validation.deleteIfUserHas(findUser.id);
        const createdValidation = await this.validation.create(findUser.id);
        if (MAILER_ENABLED) {
          await this.sendgrid.activateAccount(
            userData.email,
            createdValidation.token
          );
        }
        throw userPendingVerificationException(
          'You need to activate your account before login in. Please check your email address for a confirmation email.'
        );
      } else if (findUser.status_id === UserStatus.DISABLED) {
        await this.validation.deleteIfUserHas(findUser.id);
        const createdValidation = await this.validation.create(findUser.id);

        if (MAILER_ENABLED) {
          await this.sendgrid.restoreAccount(
            userData.email,
            createdValidation.token
          );
        }
        throw userDisabledException(
          'Your account is disabled. We will send you a reactivation email.'
        );
      }

      checkUserLoginGuard(findUser);
      if (!(await this.isProfileComplete(findUser.id))) {
        // only persist the notification in the db, don't send through the socket
        // the user will see this notification after login because is marked as unseen
        const userNotifications =
          await this.notifications.findNotificationByUserId(findUser.id);
        const userIncompleteNotification = userNotifications.filter(
          // (i) => !i.seen && i.type === NOTIFICATION_TYPE.USER_PROFILE_INCOMPLETE
          (i) => i.type === NOTIFICATION_TYPE.USER_PROFILE_INCOMPLETE
        );
        if (userIncompleteNotification.length < 1) {
          const notification = {
            user_id: findUser.id,
            scope: UserRoles.USER,
            type: NOTIFICATION_TYPE.USER_PROFILE_INCOMPLETE,
            seen: false,
            title: $UserIncomplete.title,
            // message: `User : ${findUser.id} profile incomplete`
            message: $UserIncomplete.message
          };
          await this.notifications.create(notification as any);
        }
      }

      const token = this.auth.getToken(findUser.id);
      // const refreshToken = this.auth.getRefreshToken(findUser.id);

      // await this.session.create(findUser.id, refreshToken.token);
      await this.session.create(findUser.id, token.token);

      const tokenJWT = this.auth.createJWT(token);
      // const cookie = this.auth.createCookie(refreshToken);

      // res.setHeader('Set-Cookie', [cookie]);
      res.status(STATUS_CODES.OK).json({
        data: {id: findUser.id, token: tokenJWT},
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: User = req.user;
      const refreshToken: string = req.cookies['x-refresh-token'];
      await this.session.deleteByUserIdAndToken(userData.id, refreshToken);

      res.setHeader('Set-Cookie', [`x-refresh-token=; Secure; HttpOnly;`]);
      res.status(STATUS_CODES.OK).json({
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  };

  public resetPasswordVerify = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: ResetPasswordVerifyDto = req.body;
      let findUser = await this.users.findByEmail(userData.email);
      if (!findUser) {
        findUser = {};
      }

      const responseData = {
        email: userData.email,
        phone_number: findUser.phone_number
          ? findUser.phone_number.replace(/^.{10}/g, '*******')
          : null
      };

      res.status(STATUS_CODES.OK).json({
        data: responseData,
        message: 'Verification successful'
      });
    } catch (error) {
      next(error);
    }
  };

  public resetPasswordEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // always make validations even though the user do not exists to prevent timing attacks
      const userData: ResetPasswordEmailDto = req.body;
      let findUser = await this.users.findByEmail(userData.email);
      let isValidationOK = true;
      if (!findUser) {
        findUser = {};
        findUser.status_id = UserStatus.ACTIVE;
        isValidationOK = false;
      }

      if (findUser.status_id !== UserStatus.ACTIVE) {
        isValidationOK = false;
      }

      await this.validation.deleteIfUserHas(findUser.id);
      if (isValidationOK) {
        const createdValidation = await this.validation.create(findUser.id);
        await this.sendgrid.restorePassword(
          userData.email,
          createdValidation.token
        );
      } else {
        // make some random calls to services to simulate data persist and email sending
        await this.users.findByEmail(userData.email);
        await getUniversalTime();
      }

      res.status(STATUS_CODES.OK).json({
        message:
          'If that email address is in our database, we will send you an email to reset your password.'
      });
    } catch (error) {
      next(error);
    }
  };

  public resetPasswordSMS = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // always make validations even though the user do not exists to prevent timing attacks
      const userData: ResetPasswordSMSDto = req.body;
      let findUser = await this.users.findByEmail(userData.email);
      let isValidationOK = true;
      if (!findUser) {
        findUser = {};
        findUser.status_id = UserStatus.ACTIVE;
        isValidationOK = false;
      }

      if (findUser.status_id !== UserStatus.ACTIVE) {
        isValidationOK = false;
      }

      await this.otp.deleteIfUserHas(findUser.id);
      if (isValidationOK) {
        const createdValidation = await this.otp.create(findUser.id);
        await this.twilio.restorePassword(
          findUser.phone_number,
          createdValidation.code
        );
      } else {
        // make some random calls to services to simulate data persist and sms sending
        await this.users.findByEmail(userData.email);
        await getUniversalTime();
      }

      res.status(STATUS_CODES.OK).json({
        message:
          'If that phone number is in our database, we will send you a code to reset your password.'
      });
    } catch (error) {
      next(error);
    }
  };

  public changePasswordEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: ChangePasswordEmailDto = req.body;
      const validation = await this.validation.findByToken(userData.token);
      const isTokenValid = await this.validation.isTokenValid(userData.token);
      // fix: if validation is null, mock user_id
      let findUser = await this.users.findById(validation.user_id);
      let isValidationOK = true;

      if (!findUser || !isTokenValid) {
        findUser = {};
        findUser.status_id = UserStatus.ACTIVE;
        isValidationOK = false;
      }

      if (findUser.status_id !== UserStatus.ACTIVE) {
        isValidationOK = false;
      }

      userData.new_password = await this.auth.hashPassword(
        userData.new_password
      );

      await this.validation.deleteIfExists(userData.token);
      if (isValidationOK) {
        await this.password.updateByUserId(validation.user_id, {
          hash: userData.new_password
        });

        // delete all user active sessions
        await this.session.deleteManyByUserId(validation.user_id);
      } else {
        // make some random calls to services to simulate data persist before error throw
        await this.validation.findByToken(userData.token);
        await this.users.findById(validation.user_id);

        throw genericErrorException(
          'There was a problem. Try to repeat the forgot password process'
        );
      }

      res
        .status(STATUS_CODES.OK)
        .json({message: 'Password successfully changed'});
    } catch (error) {
      next(error);
    }
  };

  public changePasswordSMS = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: ChangePasswordSMSDto = req.body;
      let findUser = await this.users.findByEmail(userData.email);
      let isValidationOK = true;
      // fix: actually the otp is validated before call change password endpoint
      // const isOTPValid = await this.otp.isOTPValid(userData.otp);

      if (!findUser /* || !isOTPValid */) {
        findUser = {};
        findUser.status_id = UserStatus.ACTIVE;
        isValidationOK = false;
      }

      if (findUser.status_id !== UserStatus.ACTIVE) {
        isValidationOK = false;
      }

      userData.new_password = await this.auth.hashPassword(
        userData.new_password
      );

      await this.otp.deleteIfExists(userData.otp);
      if (isValidationOK) {
        await this.password.updateByUserId(findUser.id, {
          hash: userData.new_password
        });

        // delete all user active sessions
        await this.session.deleteManyByUserId(findUser.id);
      } else {
        // make some random calls to services to simulate data persist before error throw
        await this.users.findByEmail(userData.email);
        await this.users.findByEmail(userData.email);

        throw genericErrorException(
          'There was a problem. Try to repeat the forgot password process'
        );
      }

      res
        .status(STATUS_CODES.OK)
        .json({message: 'Password successfully changed'});
    } catch (error) {
      next(error);
    }
  };

  public resendActivationAccountEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: ResendActivateAccountEmailDto = req.body;
      let findUser: any = await this.users.findByEmail(userData.email);
      let isValidationOK = true;
      if (!findUser) {
        findUser = {};
        findUser.status_id = UserStatus.PENDING_VERIFICATION;
        isValidationOK = false;
      }

      if (findUser.status_id !== UserStatus.PENDING_VERIFICATION) {
        isValidationOK = false;
      }

      // check if the user has a previous validation
      await this.validation.deleteIfUserHas(findUser.id);
      if (isValidationOK) {
        const createdValidation = await this.validation.create(findUser.id);
        this.sendgrid.activateAccount(userData.email, createdValidation.token);
      } else {
        // make some random calls to services to simulate data persist and email sending
        await this.users.findByEmail(userData.email);
        await getUniversalTime();
      }

      res.status(STATUS_CODES.OK).json({
        message:
          'A link to activate your account has been emailed to the address provided.'
      });
    } catch (error) {
      next(error);
    }
  };

  public resendResetPasswordEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: ResendResetPasswordEmailDto = req.body;
      let findUser = await this.users.findByEmail(userData.email);
      let isValidationOK = true;
      if (!findUser) {
        findUser = {};
        findUser.status_id = UserStatus.ACTIVE;
        isValidationOK = false;
      }

      if (findUser.status_id !== UserStatus.ACTIVE) {
        isValidationOK = false;
      }

      // check if the user has a previous validation
      await this.validation.deleteIfUserHas(findUser.id);
      if (isValidationOK) {
        const createdValidation = await this.validation.create(findUser.id);
        this.sendgrid.restorePassword(userData.email, createdValidation.token);
      } else {
        // make some random calls to services to simulate data persist and email sending
        await this.users.findByEmail(userData.email);
        await getUniversalTime();
      }

      res.status(STATUS_CODES.OK).json({
        message:
          'If that email address is in our database, we will send you an email to reset your password.'
      });
    } catch (error) {
      next(error);
    }
  };

  public resendResetPasswordSMS = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: ResendResetPasswordSMSDto = req.body;
      let findUser = await this.users.findByEmail(userData.email);
      let isValidationOK = true;
      if (!findUser) {
        findUser = {};
        findUser.status_id = UserStatus.ACTIVE;
        isValidationOK = false;
      }

      if (findUser.status_id !== UserStatus.ACTIVE) {
        isValidationOK = false;
      }

      // check if the user has a previous otp
      await this.otp.deleteIfUserHas(findUser.id);
      if (isValidationOK) {
        const createdValidation = await this.otp.create(findUser.id);
        await this.twilio.restorePassword(
          findUser.phone_number,
          createdValidation.code
        );
      } else {
        // make some random calls to services to simulate data persist and email sending
        await this.users.findByEmail(userData.email);
        await getUniversalTime();
      }

      res.status(STATUS_CODES.OK).json({
        message:
          'If that phone number is in our database, we will send you a code to reset your password.'
      });
    } catch (error) {
      next(error);
    }
  };

  public validateOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: ValidateOTPDto = req.body;
      const findUser = await this.users.findByEmail(userData.email);
      if (!findUser) {
        throw otpExpiredException('Invalid OTP');
      }

      if (findUser.status_id !== UserStatus.ACTIVE) {
        throw otpExpiredException('Invalid OTP');
      }

      const isOTPValid = await this.otp.isOTPValid(userData.otp);
      if (!isOTPValid) {
        throw otpExpiredException('Invalid OTP');
      }

      res.status(STATUS_CODES.OK).json({
        message: 'OTP validated'
      });
    } catch (error) {
      next(error);
    }
  };

  public enableAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: EnableAccountDto = req.body;
      const isTokenValid = await this.validation.isTokenValid(userData.hash);
      if (!isTokenValid) {
        throw invalidTokenException('Error enabling account');
      }

      const validationData = await this.validation.findByToken(userData.hash);
      await this.validation.deleteByUserId(validationData.user_id);

      const findUser = await this.users.findById(validationData.user_id);

      if (findUser.status_id !== UserStatus.DISABLED) {
        throw userAlreadyActivatedException('Error enabling account');
      }

      this.users.updateById(validationData.user_id, {
        status_id: UserStatus.ACTIVE
      });
      await this.activeUserResources(validationData.user_id);

      res.status(STATUS_CODES.OK).json({
        message: 'Account has been enabled'
      });
    } catch (error) {
      next(error);
    }
  };

  private activeUserResources = async (userId: string): Promise<void> => {
    await this.listings.activeByUserId(userId);
    await this.chats.activeByUserId(userId);
    const chats = await this.chats.findByUser(userId);
    for (const chat of chats) {
      await this.chatMessages.activeByChat(chat.id);
    }
  };

  public refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const refreshToken = req.cookies['x-refresh-token'];
      if (
        refreshToken === undefined ||
        refreshToken === '' ||
        refreshToken === null
      ) {
        throw missingRefreshTokenException('Refresh token missing');
      }

      const isTokenValid = await this.session.isTokenValid(refreshToken);
      if (!isTokenValid) {
        throw wrongRefreshTokenException('Wrong refresh token');
      }

      const session = await this.session.findByToken(refreshToken);

      const token = this.auth.getToken(session.user_id);
      const newRefreshToken = this.auth.getRefreshToken(session.user_id);

      await this.session.updateById(session.id, {token: newRefreshToken.token});

      const tokenJWT = this.auth.createJWT(token);
      const cookie = this.auth.createCookie(newRefreshToken);

      res.setHeader('Set-Cookie', [cookie]);
      res.status(STATUS_CODES.OK).json({
        data: {token: tokenJWT},
        message: 'Successful'
      });
    } catch (error) {
      next(error);
    }
  };

  public validateEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: ValidateEmailDto = req.body;
      const findUser = await this.users.findByEmail(userData.email);
      if (findUser) {
        if (!findUser.deleted_at) {
          throw userAlreadyExistsException(
            `The email ${userData.email} already exists`
          );
        }
      }

      res.status(STATUS_CODES.OK).json({
        message: 'Email not registered'
      });
    } catch (error) {
      next(error);
    }
  };

  private isProfileComplete = async (userId: string): Promise<boolean> => {
    const profile = await this.users.findUserProfile(userId);
    return !hasNullProp(profile);
  };
}

export default AuthController;
