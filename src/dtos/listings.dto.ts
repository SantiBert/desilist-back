import {Json} from 'aws-sdk/clients/robomaker';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf
} from 'class-validator';

export class GetAllListingsDto {
  @IsString()
  @IsOptional()
  public user_id: string;

  @IsString()
  @IsOptional()
  public category_id: string;

  @IsString()
  @IsOptional()
  public subcategory_id: string;

  @IsString()
  @IsOptional()
  public promoted: string;

  @IsString()
  @IsOptional()
  public highlighted: string;

  @IsString()
  @IsOptional()
  public status_id: string;

  @IsString()
  @IsOptional()
  public paused_at: string;

  @IsString()
  @IsOptional()
  public search: string;

  @IsString()
  @IsOptional()
  public take: string;

  @IsString()
  @IsOptional()
  public cursor: string;

  @IsString()
  @IsOptional()
  public skip: string;

  @IsString()
  @IsOptional()
  public order_by: string;

  @IsString()
  @IsOptional()
  public order: string;
}

export class GetListingsMeDto extends GetAllListingsDto {}

export class CreateListingDto {
  @IsNumber()
  public subcategory_id: number;

  @IsString()
  public user_id: string;

  @IsString()
  public title: string;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public description: string | null;

  @IsArray()
  @ValidateIf((object, value) => value !== null)
  public images: string[];

  @IsNumber()
  public price: number;

  @IsObject()
  @ValidateIf((object, value) => value !== null)
  public location: Json | null;

  @IsObject()
  @ValidateIf((object, value) => value !== null)
  public contact: Json | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public website: string | null;

  @IsObject()
  @ValidateIf((object, value) => value !== null)
  public custom_fields: Json | null;

  @IsObject()
  @ValidateIf((object, value) => value !== null)
  public selected_packages: Json | null;
}

export class UpdateListingDto extends CreateListingDto {}

export class DeleteListingDto {}

export class PublishListingDto {}

export class PauseListingDto {}

export class UnpauseListingDto {}

export class HighlightListingDto {}

export class CancelHighlightListingDto {}

export class PromoteListingDto {
  @IsNumber()
  public promote_package_id: number;
}

export class ReportListingDto {
  @IsNumber()
  public reason_id: number;

  @IsString()
  public comment: string;
}

export class FlagListingDto {
  @IsArray()
  public reasons: number[];

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public comment: string;
}

export class UnflagListingDto {}
