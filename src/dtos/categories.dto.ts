import {IsArray, IsNumber, IsString, ValidateIf} from 'class-validator';

export class CreateCategoryDto {
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

  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public order: number;
}

export class UpdateCategoryDto extends CreateCategoryDto {}

export class UpdateCategoryOrderDto {
  @IsArray()
  public categories: CategoryOrderDto[];
}

export class CategoryOrderDto {
  @IsNumber()
  public id: number;

  @IsNumber()
  public order: number;
}
