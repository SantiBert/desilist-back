import prisma from '@/db';
import {diffToNowInDays} from '../../utils/time';
import {ChatStates} from '@/constants/chats';
import {getISONow} from '@/utils/time';

const DAYS_FROM_DEACTIVATION = 30;

function isListingDeactivatedMonthAgo(deactivated_at: any): boolean {
  // uncomment for debug
  // console.log(Math.ceil(-diffToNowInDays(deactivated_at)));
  return Math.ceil(-diffToNowInDays(deactivated_at)) >= DAYS_FROM_DEACTIVATION;
}

async function archiveChat(): Promise<void> {
  const listing = prisma.listing;
  const chat = prisma.chat;
  const chatMessage = prisma.chatMessage;

  /* get deactivated listings */
  const listings = await listing.findMany({
    select: {
      id: true,
      deactivated_at: true
    },
    where: {
      deactivated_at: {not: null}
    }
  });

  for (const list of listings) {
    // uncomment for debug
    // console.log(list.id, ": ", isListingDeactivatedMonthAgo(list.deactivated_at));
    if (isListingDeactivatedMonthAgo(list.deactivated_at)) {
      /* get all chats related to deactivated listing */
      const chats = await chat.findMany({
        select: {
          id: true
        },
        where: {
          listing_id: list.id
        }
      });

      await chat.updateMany({
        data: {status: ChatStates.ARCHIVED, updated_at: getISONow()},
        where: {
          listing_id: list.id
        }
      });

      // uncomment for debug
      // console.log(chats);
      /* delete all messages related to chats */
      for (const cht of chats) {
        await chatMessage.deleteMany({
          where: {chat_id: cht.id}
        });
      }
    }
  }
}

archiveChat()
  .then(() => {
    console.log('Job archiveChats successfully executed');
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    throw e;
  });
