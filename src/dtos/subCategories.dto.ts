import {Subcategory} from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsString,
  ValidateIf
} from 'class-validator';

export class BasicPricingPackageDto {
  @IsNumber()
  public id: number;

  @IsNumber()
  public basic_per_day: number;
}

export class PromotePricingPackageDto {
  @IsNumber()
  public id: number;

  @IsNumber()
  public promote_per_day: number;
}

export class CreateSubCategoryDto {
  @IsNumber()
  public category_id: number;

  @IsString()
  public name: string;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public icon: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public image: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public description: string | null;

  @IsArray()
  @ValidateIf((object, value) => value !== null)
  public custom_fields: string[] | null;

  @IsArray()
  public basic_pricing_package: BasicPricingPackageDto;

  @IsArray()
  public promote_pricing_package: PromotePricingPackageDto;

  @IsBoolean()
  public free: boolean;
}

export class UpdateSubCategoryDto {
  @IsString()
  public name: string;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public icon: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public image: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public description: string | null;

  @IsArray()
  @ValidateIf((object, value) => value !== null)
  public custom_fields: string[] | null;

  @IsArray()
  public basic_pricing_package: BasicPricingPackageDto;

  @IsArray()
  public promote_pricing_package: PromotePricingPackageDto;

  @IsBoolean()
  public free: boolean;

  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public order: number;
}

export class GetAllSubcategoryDto {
  @IsArray()
  public data: Subcategory[];

  @IsNumber()
  public total: number;

  @IsNumber()
  public cursor: number;
}

export class DeleteSubCategoryDto {}

export class UpdateSubCategoryOrderDto {
  @IsArray()
  public subcategories: SubCategoryOrderDto[];
}

export class SubCategoryOrderDto {
  @IsNumber()
  public id: number;

  @IsNumber()
  public order: number;

  @IsBoolean()
  public landingShow: boolean;
}
