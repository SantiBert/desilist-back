import {
    IsString,
    IsNumber,
    ValidateIf,
    IsBoolean,
    IsArray
  } from 'class-validator';

export class PromotePricingPackageDto {
  @IsNumber()
  public id: number;

  @IsNumber()
  public promote_per_day: number;
}

export class CreateEventSubcategoryDto {

  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public category_id: number;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public name: string | null;

  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public event_publication_price:number;

  @IsArray()
  public custom_fields: string[] | null;

  @IsNumber()
  public service_fee: number | null;

  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public list_order: number | null;

  @IsBoolean()
  public is_free: boolean;

  @IsBoolean()
  public showed_landing: boolean;

  @IsArray()
  public promote_pricing_package: PromotePricingPackageDto;

}

export class GetEventSubcategoryDto {}

export class DeleteEventSubcategoryDto {}

export class UpdateEventSubcategoryDto {

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public name: string | null;

  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public event_publication_price:number;

  @IsArray()
  public custom_fields: string[] | null;

  @IsNumber()
  public service_fee: number | null;

  @IsBoolean()
  public is_free: boolean;

  @IsBoolean()
  public showed_landing: boolean;

  @IsArray()
  public promote_pricing_package: PromotePricingPackageDto;
}

export class UpdateEventSubCategoryOrderDto {
  @IsArray()
  public subcategories: EventSubCategoryOrderDto[];
}

export class EventSubCategoryOrderDto {
  @IsNumber()
  public id: number;

  @IsNumber()
  public order: number;

  @IsBoolean()
  public landingShow: boolean;
}