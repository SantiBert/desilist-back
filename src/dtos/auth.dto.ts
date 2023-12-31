import {
  IsEmail,
  IsString,
  // isPhoneNumber,
  ValidateIf,
  IsBase64,
  Length,
  MaxLength,
  IsHexadecimal
} from 'class-validator';
import config from '@/config';

const OTP_LEN = config.otp.length;

class EmailValidator {
  @IsEmail()
  public email: string;
}

export class ResetPasswordVerifyDto extends EmailValidator {}

export class ResetPasswordEmailDto extends EmailValidator {}

export class ResetPasswordSMSDto extends EmailValidator {
  // @IsPhoneNumber()
  // public phone_number: string;
}

export class ResendActivateAccountEmailDto extends EmailValidator {}

export class ResendResetPasswordEmailDto extends EmailValidator {}

export class ResendResetPasswordSMSDto extends EmailValidator {}

export class SignupDto extends EmailValidator {
  @IsString()
  public full_name: string;

  // @IsPhoneNumber()
  @IsString()
  @ValidateIf((object, value) => value !== null)
  public phone_number: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public country: string | null;

  @IsString()
  public zip_code: string;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public city: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public state: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public photo: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public bio: string | null;

  @IsString()
  @MaxLength(72)
  public password: string;
}

export class ActivateAccountDto {
  @IsHexadecimal()
  @MaxLength(128)
  public hash: string;
}

export class LogInDto extends EmailValidator {
  @IsString()
  @MaxLength(72)
  @ValidateIf((object, value) => value !== null)
  public password: string;
}

export class LogOutDto {}

export class ValidateOTPDto extends EmailValidator {
  @IsString()
  @Length(OTP_LEN, OTP_LEN)
  public otp: string;
}

export class ValidateHashedOTPDto {
  @IsBase64()
  public hash: string;
}

export class ValidateEmailDto extends EmailValidator {}

export class ChangePasswordEmailDto {
  @IsString()
  public new_password: string;
  @IsHexadecimal()
  @MaxLength(128)
  public token: string;
}

export class CreateRefreshTokenDto {}
export class ChangePasswordSMSDto extends EmailValidator {
  @IsString()
  public new_password: string;
  @IsString()
  @Length(OTP_LEN, OTP_LEN)
  public otp: string;
}

export class EnableAccountDto {
  @IsHexadecimal()
  @MaxLength(128)
  public hash: string;
}
