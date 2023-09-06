import {Chat, ChatMessage} from '@prisma/client';

export interface GetAllMessage {
  chat: any;
  messages: ChatMessage[];
}
export interface GetAllChat {
  chat: Chat[];
}
