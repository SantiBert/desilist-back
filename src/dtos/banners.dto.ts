import {
  IsArray,
  IsNumber,
  IsString,
  ValidateIf,
  IsUrl,
  IsEnum,
  IsBoolean
} from 'class-validator';
import {BannerSource, BannerType} from '@/constants/banners';
export class CreateBannerDto {
  @IsString()
  public user_id: string;

  @IsEnum(BannerType, {})
  @IsString()
  public banner_type: BannerType;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public name: string | null;

  @IsUrl()
  @ValidateIf((object, value) => value !== null)
  public link: string | null;

  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public price: number | null;

  @IsArray()
  @ValidateIf((object, value) => value !== null)
  public desktop_image: string[];

  @IsArray()
  @ValidateIf((object, value) => value !== null)
  public mobile_image: string[];

  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public category_id: number | null;

  @IsEnum(BannerSource, {})
  @IsString()
  public source: BannerSource;

  @IsBoolean()
  public paused: boolean;
}

export class UpdateBannerDto extends CreateBannerDto {}
