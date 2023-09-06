import {IsBoolean, IsNumber, IsString} from 'class-validator';

export class CreateChatMessageDto {
  @IsNumber()
  public chat_id: number | null;

  @IsString()
  public message: string;

  @IsBoolean()
  public seen: boolean;
}

export class UpdateChatMessageDto extends CreateChatMessageDto {}
