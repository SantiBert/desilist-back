import {Router} from 'express';
import AuthController from '@controllers/auth.controller';
import {
  CreateRefreshTokenDto,
  ActivateAccountDto,
  ChangePasswordEmailDto,
  ChangePasswordSMSDto,
  LogInDto,
  LogOutDto,
  ResendActivateAccountEmailDto,
  ResendResetPasswordEmailDto,
  ResendResetPasswordSMSDto,
  ResetPasswordEmailDto,
  ResetPasswordSMSDto,
  ResetPasswordVerifyDto,
  SignupDto,
  ValidateEmailDto,
  ValidateHashedOTPDto,
  ValidateOTPDto,
  EnableAccountDto
} from '@dtos/auth.dto';
import {Routes} from '@interfaces/routes.interface';
import authMiddleware from '@middlewares/auth.middleware';
import validationMiddleware from '@middlewares/validation.middleware';
import {checkAPIVersion} from '@/middlewares/apiVersion.middleware';
import {otpAndEmailFromBase64} from '@/middlewares/otp.middleware';

class AuthRoute implements Routes {
  public path = '/';
  public router = Router();
  public authController = new AuthController();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}signup`,
      checkAPIVersion,
      validationMiddleware(SignupDto, 'body'),
      this.authController.signUp
    );
    this.router.post(
      `${this.path}activate_account`,
      checkAPIVersion,
      validationMiddleware(ActivateAccountDto, 'body'),
      this.authController.activateAccount
    );
    this.router.post(
      `${this.path}login`,
      checkAPIVersion,
      validationMiddleware(LogInDto, 'body'),
      this.authController.logIn
    );
    this.router.post(
      `${this.path}logout`,
      checkAPIVersion,
      validationMiddleware(LogOutDto, 'body'),
      authMiddleware(),
      this.authController.logOut
    );
    this.router.post(
      `${this.path}reset_password_verify`,
      checkAPIVersion,
      validationMiddleware(ResetPasswordVerifyDto, 'body'),
      this.authController.resetPasswordVerify
    );
    this.router.post(
      `${this.path}reset_password_email`,
      checkAPIVersion,
      validationMiddleware(ResetPasswordEmailDto, 'body'),
      this.authController.resetPasswordEmail
    );
    this.router.post(
      `${this.path}reset_password_sms`,
      checkAPIVersion,
      validationMiddleware(ResetPasswordSMSDto, 'body'),
      this.authController.resetPasswordSMS
    );
    this.router.post(
      `${this.path}change_password_email`,
      checkAPIVersion,
      validationMiddleware(ChangePasswordEmailDto, 'body'),
      this.authController.changePasswordEmail
    );
    this.router.post(
      `${this.path}change_password_sms`,
      checkAPIVersion,
      validationMiddleware(ChangePasswordSMSDto, 'body'),
      this.authController.changePasswordSMS
    );
    this.router.post(
      `${this.path}resend_activate_account_email`,
      checkAPIVersion,
      validationMiddleware(ResendActivateAccountEmailDto, 'body'),
      this.authController.resendActivationAccountEmail
    );
    this.router.post(
      `${this.path}resend_reset_password_email`,
      checkAPIVersion,
      validationMiddleware(ResendResetPasswordEmailDto, 'body'),
      this.authController.resendResetPasswordEmail
    );
    this.router.post(
      `${this.path}resend_reset_password_sms`,
      checkAPIVersion,
      validationMiddleware(ResendResetPasswordSMSDto, 'body'),
      this.authController.resendResetPasswordSMS
    );
    this.router.post(
      `${this.path}validate_otp`,
      checkAPIVersion,
      validationMiddleware(ValidateOTPDto, 'body'),
      this.authController.validateOTP
    );
    this.router.post(
      `${this.path}validate_hashed_otp`,
      checkAPIVersion,
      validationMiddleware(ValidateHashedOTPDto, 'body'),
      otpAndEmailFromBase64,
      validationMiddleware(ValidateOTPDto, 'body'),
      this.authController.validateOTP
    );
    this.router.post(
      `${this.path}enable_account`,
      checkAPIVersion,
      validationMiddleware(EnableAccountDto, 'body'),
      this.authController.enableAccount
    );
    this.router.post(
      `${this.path}refresh_token`,
      checkAPIVersion,
      validationMiddleware(CreateRefreshTokenDto, 'body'),
      this.authController.refreshToken
    );
    this.router.post(
      `${this.path}validate_email`,
      checkAPIVersion,
      validationMiddleware(ValidateEmailDto, 'body'),
      this.authController.validateEmail
    );
  }
}

export default AuthRoute;
