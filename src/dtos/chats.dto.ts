import {IsNumber, IsString, ValidateIf, IsEnum} from 'class-validator';
import {ChatStates} from '@/constants/chats';

export class CreateChatDto {
  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public listing_id: number | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public room: string | null;

  @IsString()
  public from_id: string;

  @IsString()
  public to_id: string;

  @IsEnum(ChatStates, {})
  @IsString()
  public status: ChatStates;
}

export class UpdateChatDto extends CreateChatDto {}
