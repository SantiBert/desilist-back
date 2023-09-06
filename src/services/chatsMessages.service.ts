import {ChatMessage} from '@prisma/client';
import prisma from '@/db';
import {Integer} from 'aws-sdk/clients/cloudtrail';
import {getISONow} from '@/utils/time';
import {GetAllMessage} from '../interfaces/chatMessage.interface';
import arraySort from 'array-sort';

export class ChatMessageService {
  public chatMessage = prisma.chatMessage;
  public chatEmailNotification = prisma.chatEmailNotification;

  public async findById(id: number): Promise<Partial<GetAllMessage>> {
    const messageData = {
      chat: {},
      messages: []
    };
    const selectChat = {
      chat: {
        select: {
          id: true,
          listing: {
            select: {
              id: true,
              title: true,
              description: true,
              images: true,
              listing_status: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          room: true,
          from: {
            select: {
              id: true,
              full_name: true
            }
          },
          to: {
            select: {
              id: true,
              full_name: true
            }
          },
          locked_by: true
        }
      }
    };
    const selectMessage = {
      id: true,
      chat_id: true,
      message: true,
      date: true,
      time: true,
      seen: true,
      sent_by: true,
      deleted_at: true
    };
    const whereChat = {
      chat: {
        id: id,
        deleted_at: null
      }
    };
    const whereMessage = {
      chat_id: id,
      deleted_at: null
    };
    //query
    const queryChat = {
      select: selectChat,
      where: whereChat
    };
    const queryMessage = {
      select: selectMessage,
      where: whereMessage
    };
    messageData.chat = await this.chatMessage.findFirst(queryChat);
    messageData.messages = await this.chatMessage.findMany(queryMessage);
    messageData.messages = arraySort(messageData.messages, 'id');

    return messageData;
  }
  public async create(data: ChatMessage): Promise<Partial<ChatMessage> | null> {
    return await this.chatMessage.create({
      data: {...data, date: getISONow(), time: getISONow(), seen: false}
    });
  }
  public async updateById(
    id: number,
    data: Partial<ChatMessage>
  ): Promise<Partial<ChatMessage> | null> {
    return await this.chatMessage.update({
      select: {id: true},
      data,
      where: {id}
    });
  }
  public async updateSeen(
    id: number,
    authId: string,
    data: Partial<ChatMessage>
  ): Promise<void> {
    await this.chatMessage.updateMany({
      data: {...data, updated_at: getISONow()},
      where: {
        chat_id: id,
        NOT: {
          sent_by: authId
        }
      }
    });
  }
  public async delete(id: Integer): Promise<void> {
    await this.chatMessage.update({
      data: {deleted_at: getISONow()},
      where: {
        id
      }
    });
  }
  public async deleteByChat(id: Integer): Promise<void> {
    await this.chatMessage.updateMany({
      data: {deleted_at: getISONow()},
      where: {
        chat_id: id
      }
    });
  }
  public async findByChatNotification(
    authId: string,
    id: Integer
  ): Promise<any> {
    return await this.chatEmailNotification.findUnique({
      where: {user_id_chat_id: {user_id: authId, chat_id: id}},
      select: {user_id: true}
    });
  }
  public async deleteByChatNotification(
    userId: string,
    id: Integer
  ): Promise<void> {
    await this.chatEmailNotification.delete({
      where: {user_id_chat_id: {user_id: userId, chat_id: id}}
    });
  }
  public async activeByChat(id: Integer): Promise<void> {
    await this.chatMessage.updateMany({
      data: {deleted_at: null},
      where: {
        chat_id: id
      }
    });
  }
}
