import {Chat, ChatMessage} from '@prisma/client';
import prisma from '@/db';
import {getISONow} from '@/utils/time';
import {ChatStates} from '@/constants/chats';
import {GetAllChat} from '../interfaces/chatMessage.interface';
export class ChatService {
  public chat = prisma.chat;
  public chatMessage = prisma.chatMessage;

  public async find(params?): Promise<Partial<Chat>> {
    if (params) {
      params.from_id ? (params.from_id = params.from_id) : '';
      params.listing_id ? (params.listing_id = +params.listing_id) : null;
    }
    return await this.chat.findFirst({
      select: {id: true},
      where: {
        OR: [
          {
            from_id: params.from_id
          },
          {
            to_id: params.from_id
          }
        ],
        listing_id: params.listing_id,
        deleted_at: null
      }
    });
  }
  public async findByListing(listingId): Promise<Partial<GetAllChat>> {
    const chatData = {
      chat: []
    };
    const select = {
      id: true
    };
    const where = {
      listing_id: listingId,
      deleted_at: null
    };
    const query = {
      select,
      where
    };
    chatData.chat = await this.chat.findMany(query);
    return chatData;
  }

  public async findById(id: number): Promise<Partial<any> | null> {
    return await this.chat.findUnique({
      select: {
        id: true,
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            paused_at: true,
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
            full_name: true,
            photo: true,
            photo_json: true
          }
        },
        to: {
          select: {
            id: true,
            full_name: true,
            photo: true,
            photo_json: true
          }
        },
        locked_by: true
      },
      where: {id}
    });
  }

  public async findByRoom(room: any): Promise<Partial<Chat> | null> {
    return await this.chat.findFirst({
      select: {
        id: true
      },
      where: {room}
    });
  }

  public async create(data: Chat): Promise<Partial<Chat> | null> {
    return await this.chat.create({
      data: {...data, status: ChatStates.ACTIVE}
    });
  }
  public async createChatMessage(
    data: ChatMessage
  ): Promise<Partial<ChatMessage> | null> {
    return await this.chatMessage.create({
      data
    });
  }

  public async findByUser(from_id: string): Promise<Partial<Chat>[]> {
    const selectChat = {
      id: true,
      listing: {
        select: {
          id: true,
          title: true,
          description: true,
          images: true,
          paused_at: true,
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
          full_name: true,
          photo: true,
          photo_json: true
        }
      },
      to: {
        select: {
          id: true,
          full_name: true,
          photo: true,
          photo_json: true
        }
      },
      chat_message: {
        select: {
          id: true,
          message: true,
          date: true,
          time: true,
          seen: true,
          sent_by: true,
          deleted_at: true
        },
        take: -1
      },
      locked_by: true,
      status: true,
      date_last_message: true
    };
    const whereChat = {
      OR: [
        {
          from_id
        },
        {
          to_id: from_id
        }
      ],
      deleted_at: null
    };
    //query
    const queryChat = {
      where: whereChat,
      select: selectChat
    };
    const messageChat = await this.chat.findMany(queryChat);

    return messageChat;
  }

  public async updateLocked(id: number, data: Partial<Chat>): Promise<void> {
    await this.chat.updateMany({
      data: {...data, updated_at: getISONow()},
      where: {id}
    });
  }

  public async archiveChat(id: number): Promise<void> {
    await this.chat.updateMany({
      data: {status: ChatStates.ARCHIVED, updated_at: getISONow()},
      where: {id}
    });
  }

  public async updateDateLast(id: number): Promise<void> {
    await this.chat.update({
      data: {date_last_message: getISONow()},
      where: {id}
    });
  }

  public async deleteByUserId(userId: string): Promise<void> {
    await this.chat.updateMany({
      data: {deleted_at: getISONow()},
      where: {
        OR: [{from_id: userId}, {to_id: userId}]
      }
    });
  }
  public async activeByUserId(userId: string): Promise<void> {
    await this.chat.updateMany({
      data: {deleted_at: null},
      where: {
        OR: [{from_id: userId}, {to_id: userId}]
      }
    });
  }
}
