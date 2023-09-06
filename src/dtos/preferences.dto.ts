import {IsJSON} from 'class-validator';

export class UnsubscribeDto {
  @IsJSON()
  public unsubscribe: any;
}
