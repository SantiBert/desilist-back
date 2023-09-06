import {ChatService} from '../services/chats.service';
import {NextFunction, Response} from 'express';
import {Chat, User} from '@prisma/client';
import {STATUS_CODES, UserRoles} from '@/constants';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {CreateChatDto} from '../dtos/chats.dto';
import {ListingService} from '../services/admin/listings.service';
import {ChatMessageService} from '../services/chatsMessages.service';
import config from '@/config';
import {NOTIFICATION_TYPE} from '@/constants/notifications';
import notifications from '@/notifications';
import {NotificationService} from '@/services/notification.service';

const NOTIFICATION_ENABLED = config.notification_service.enabled;
const $bodyChat = {
  title: 'You have a new Message',
  message: ''
};
class ChatController {
  public chat = new ChatService();
  public chatMessage = new ChatMessageService();
  public listing = new ListingService();
  private notifications = new NotificationService();

  public existChat = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params = req.query;
      const exist: Partial<Chat> = await this.chat.find(params);

      res.status(STATUS_CODES.OK).json({
        data: exist,
        message: 'OK'
      });
    } catch (error) {
      next(error);
    }
  };
  public createChat = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const chatData: CreateChatDto = req.body.data;
      const listingId: number = chatData.listing_id;

      let data: any;
      if (listingId) {
        const listing: any = await this.listing.findById(listingId);
        data = {
          ...chatData,
          to_id: listing.user.id
        };
      } else {
        data = {
          ...chatData
        };
      }
      const createdChat = await this.chat.create(data as any);
      if (!createdChat) {
        throw new Error('Server Error');
      }

      res
        .status(STATUS_CODES.CREATED)
        .json({data: {chat: createdChat}, message: 'created'});
    } catch (error) {
      next(error);
    }
  };
  public createMessage = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const messageData: CreateChatDto = req.body.data;
      const data = {
        ...messageData
      };

      const createdChatMessage = await this.chatMessage.create(data as any);

      if (!createdChatMessage) {
        throw new Error('Server Error');
      }
      await this.chat.updateDateLast(createdChatMessage.chat_id);
      const chat = await this.chat.findById(createdChatMessage.chat_id);
      $bodyChat.message =
        createdChatMessage.sent_by === chat.from.id
          ? `${chat.from.full_name} has sent you a message`
          : `${chat.to.full_name} has sent you a message`;
      if (NOTIFICATION_ENABLED) {
        const notification: any = {
          user_id:
            createdChatMessage.sent_by === chat.from.id
              ? chat.to.id
              : chat.from.id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.NEW_MESSAGE,
          seen: false,
          title: $bodyChat.title,
          message: $bodyChat.message,
          data: {chat: chat}
        };
        const notificationId = await this.notifications.create(
          notification as any
        );
        notification.id = notificationId.id;
        notification.created_at = notificationId.created_at;
        notifications.newMessage(notification);
      }

      res
        .status(STATUS_CODES.CREATED)
        .json({data: {chat: createdChatMessage}, message: 'created'});
    } catch (error) {
      next(error);
    }
  };
  public seenMessage = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const authId: string = req.user.id;
      await this.chatMessage.updateSeen(id, authId, {
        seen: true
      });

      const notified: any = await this.chatMessage.findByChatNotification(
        authId,
        id
      );

      if (notified) {
        await this.chatMessage.deleteByChatNotification(authId, id);
      }

      res.status(STATUS_CODES.OK).json({message: 'Chat viewed'});
    } catch (error) {
      next(error);
    }
  };
  public getChatById = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const findChat: any = await this.chatMessage.findById(id);

      res.status(STATUS_CODES.OK).json(findChat);
    } catch (error) {
      next(error);
    }
  };

  private orderByMessage = (a, b): any => {
    if (a['chat_message'].length > 0 && b['chat_message'].length > 0) {
      return a['chat_message'][0]['id'] - b['chat_message'][0]['id'];
    }
  };

  private orderByMessageSeen = (a, b): any => {
    if (a['chat_message'].length > 0 && b['chat_message'].length > 0) {
      return a['chat_message'][0]['seen'] - b['chat_message'][0]['seen'];
    }
  };

  public getChatByUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const fromId: User = req.user;
      const findChatByUser: any = await this.chat.findByUser(fromId.id);
      // fix: remove order by from here

      const sortedMessage = findChatByUser.sort(this.orderByMessage).reverse();
      const sortedMessageSeen = sortedMessage.sort(this.orderByMessageSeen);
      const unseen = sortedMessageSeen.filter((chat) => {
        if (chat['chat_message'].length > 0) {
          return (
            chat['chat_message'][0]['sent_by'] !== fromId.id &&
            !chat['chat_message'][0]['seen']
          );
        }
      });
      const seen = sortedMessageSeen.filter((chat) => {
        if (chat['chat_message'].length > 0) {
          return !(
            chat['chat_message'][0]['sent_by'] !== fromId.id &&
            !chat['chat_message'][0]['seen']
          );
        }
      });
      const chats = findChatByUser.filter((chat) => {
        if (chat['chat_message'].length === 0) {
          return chat;
        }
      });
      const messageRoom = [
        ...unseen.sort(this.orderByMessage).reverse(),
        ...seen.sort(this.orderByMessage).reverse(),
        ...chats
      ];
      if (messageRoom.length > 1) {
        res.status(STATUS_CODES.OK).json(messageRoom);
      } else {
        res.status(STATUS_CODES.OK).json(sortedMessageSeen);
      }
    } catch (error) {
      next(error);
    }
  };

  public getChatByRoom = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const room = req.query.room;
      const findChatByRoom: any = await this.chat.findByRoom(room);

      res.status(STATUS_CODES.OK).json(findChatByRoom);
    } catch (error) {
      next(error);
    }
  };

  public lockedChat = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const userId: User = req.user;
      const chatToBlocked = await this.chat.findById(id);
      let message = '';
      if (!chatToBlocked.locked_by) {
        await this.chat.updateLocked(id, {
          locked_by: userId.id
        });
        message = 'Chat blocked';
      } else {
        await this.chat.updateLocked(id, {
          locked_by: null
        });
        message = 'Chat unblocked';
      }

      res.status(STATUS_CODES.OK).json({message});
    } catch (error) {
      next(error);
    }
  };
  public archivedChat = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const listingId = Number(req.params.id);

      const findChat = await this.chat.findByListing(listingId);
      if (findChat) {
        findChat.chat.forEach(async (chat) => {
          await this.chat.archiveChat(chat.id);
          await this.chatMessage.deleteByChat(chat.id);
        });
      }

      res.status(STATUS_CODES.OK).json({
        message: 'Chat Archived'
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ChatController;
