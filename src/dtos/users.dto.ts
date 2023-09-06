import {
  IsEmail,
  IsString,
  // isPhoneNumber,
  ValidateIf,
  MaxLength
} from 'class-validator';

export class GetUserDto {}

export class MeUserDto {}

export class UpdateUserDto {
  @IsString()
  public full_name: string;

  // @IsPhoneNumber()
  @IsString()
  @ValidateIf((object, value) => value !== null)
  public phone_number: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public country: string;

  @IsString()
  public zip_code: string;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public city: string;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public state: string;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public photo: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public bio: string | null;

  @IsEmail()
  @ValidateIf((object, value) => value !== null)
  public alternative_email: string;
}

export class UpdateUserProfileDto extends UpdateUserDto {}

export class DeleteUserDto {
  @IsString()
  @MaxLength(72)
  public password: string;
}

export class DisableUserDto {
  @IsString()
  @MaxLength(72)
  public password: string;
}

export class ChangeUserPasswordDto {
  @IsString()
  public password: string;

  @IsString()
  public new_password: string;
}
