import {IsNumber, IsString} from 'class-validator';

export class CreateEventBookmarkDto {
  @IsNumber()
  public event_id: number;
}

export class UpdateEventBookmarkDto extends CreateEventBookmarkDto {}
