import {IsNumber, IsString} from 'class-validator';

export class CreateBookmarkDto {
  @IsString()
  public user_id: string;

  @IsNumber()
  public listing_id: number;
}

export class UpdateBookmarkDto extends CreateBookmarkDto {}
