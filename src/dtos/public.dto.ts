import {IsEmail, /* isPhoneNumber, */ IsString, Length} from 'class-validator';

class EmailValidator {
  @IsEmail()
  public email: string;
}

export class ContactUsDto extends EmailValidator {
  @IsString()
  public name;
  @IsString()
  public message;
}

export class LocationDto {
  @IsString()
  @Length(3, 5)
  public zip_code: string;
}

export class PhoneNumberDto {
  // @IsPhoneNumber()
  @IsString()
  public phone_number: string;
}

export class ContactWithCaptcha extends ContactUsDto {
  @IsString()
  public token;
}
