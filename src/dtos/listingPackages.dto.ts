import {IsNumber, ValidateIf} from 'class-validator';

export class CreatePackageDto {
  @IsNumber()
  public listing_id: number;

  @IsNumber()
  public basic_package_id: number;

  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public promote_package_id: number | null;
}

export class PromotePackageDto {
  @IsNumber()
  public id: number;

  @IsNumber()
  public package_id: number;
}
