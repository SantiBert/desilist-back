import {IsNumber} from 'class-validator';

export class SetReadNotificationDto {
  @IsNumber()
  public id: number;
}

export class SetReadManyNotificationDto {}
