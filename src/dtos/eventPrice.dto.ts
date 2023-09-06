import {
    IsString,
    IsNumber,
    ValidateIf,
    IsBoolean,
    IsArray
  } from 'class-validator';

export class CreateEventPriceDto {

  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public event_subcategory_id: number;

  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public promote_pricing_id: number;

  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public promote_per_day: number;
}

export class GetBySubcategoryDto {
  @IsString()
  public id: string;
}

export class GetEventPriceDto {}

export class GetAllEventPriceDto {}

export class DeleteEventPriceDto {}

export class UpdateEventPriceDto extends CreateEventPriceDto {}