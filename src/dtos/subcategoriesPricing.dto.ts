import {IsString} from 'class-validator';

export class GetBySubcategoryDto {
  @IsString()
  public id: string;
}
