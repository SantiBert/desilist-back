import prisma from '@/db';
import {SendGridService} from '@/services';
import {diffToNowInMinutes} from '../../utils/time';
import config from '@/config';

const MINUTES_TO_NOTIFY = 20;
const FE_URL = config.frontend.url;
const FE_CHATS_ENDP = config.frontend.endpoints.chat;
const FE_UNSUSCRIBE_ENDP = config.frontend.endpoints.unsuscribe;

function needToNotify(created_at: any): boolean {
  // uncomment for debug
  // console.log('DiffToNowInMinutes only: ' + Math.ceil(-diffToNowInMinutes(created_at)));
  // console.log(Math.ceil(-diffToNowInMinutes(created_at)));

  return Math.ceil(-diffToNowInMinutes(created_at)) >= MINUTES_TO_NOTIFY;
}

async function notifyNotSeenChatMsg(): Promise<void> {
  const chatMessage = prisma.chatMessage;
  const chatEmailNotification = prisma.chatEmailNotification;
  const sendgrid = new SendGridService();
  const notSeenChatMessages = await chatMessage.findMany({
    select: {
      id: true,
      chat_id: true,
      message: true,
      chat: {
        select: {
          from: {
            select: {
              id: true,
              email: true,
              full_name: true,
              photo: true
            }
          },
          to: {
            select: {
              id: true,
              email: true,
              full_name: true,
              photo: true
            }
          }
        }
      },
      created_at: true,
      sent_by: true
    },
    where: {
      seen: false,
      deleted_at: null
    }
  });
  for (const message of notSeenChatMessages) {
    /* if sent_by === from then we need to notify the recipient but the origin */
    const receiver =
      message.sent_by === message.chat.from.id
        ? message.chat.to
        : message.chat.from;
    const notified = await chatEmailNotification.findUnique({
      where: {user_id_chat_id: {user_id: receiver.id, chat_id: message.chat_id}}
    });

     if (notified) {
       continue;
     }

    if (needToNotify(message.created_at)) {
      await sendgrid.newChatMessage(
        receiver.email,
        receiver.full_name === message.chat.to.full_name ? message.chat.from.full_name : receiver.full_name,
        receiver.photo === message.chat.to.photo ? message.chat.from.photo : receiver.photo,
        message.message,
        `${FE_URL}/${FE_CHATS_ENDP}`,
        `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`
      );
      await chatEmailNotification.create({
        data: {user_id: receiver.id, chat_id: message.chat_id}
      });
    }
  }
}

notifyNotSeenChatMsg()
  .then(() => {
    console.log('Job notifyUnseenChatMsg successfully executed');
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    throw e;
  });
