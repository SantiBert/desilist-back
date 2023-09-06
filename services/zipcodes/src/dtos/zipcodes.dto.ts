import {IsString, Length} from 'class-validator';

export class LocationDto {
  @IsString()
  @Length(3, 5)
  public zip_code: string;
}
