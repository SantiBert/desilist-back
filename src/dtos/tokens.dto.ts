import {IsString, Length} from 'class-validator';

export class CreateTokenCVCDto {
  @IsString()
  @Length(3, 4)
  public cvc: string;
}
