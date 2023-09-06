import prisma from '@/db';
import {diffToNowInDays} from '../../utils/time';
import {SendGridService} from '@/services';
import notifications from '../../notifications';
import {UserRoles} from '../../constants';
import {NOTIFICATION_TYPE} from '../../constants/notifications';
import config from '@/config';

const $ListingPromoteExpire = {
  title: 'Your Promoted listing is about to expire',
  message: 'Update your listing to keep it active!'
};

const $ListingExpire = {
  title: 'Your listing is about to expire',
  message: 'Update your listing to keep it active!'
};

const FE_URL = config.frontend.url;
const FE_DASHBOARD_ENDPOINT = config.frontend.endpoints.dashboard;

const DAYS_TO_EXPIRE_STATIC = [6, 1, 0];

async function listingAboutToExpireChecker(): Promise<void> {
  const listingPackage = prisma.listingPackage;
  const listing = prisma.listing;
  const notificationServ = prisma.notification;
  const sendgrid = new SendGridService();

  const listingPackages = await listingPackage.findMany({
    select: {
      listing: {
        select: {
          id: true,
          user_id: true,
          title: true,
          subcategory: {
            select: {
              id: true,
              name: true,
              category: {select: {id: true, name: true}}
            }
          },
          images: true,
          user: {
            select: {
              email:true
            }
          }
        },
      },
      basic_package: {
        select: {
          id: true,
          duration: true
        }
      },
      promote_package: {
        select: {
          id: true,
          duration: true
        }
      },
      created_at: true,
      activated_at: true
    },
    where: {
      // active: true,
      paused_at: null,
      listing: {
        deleted_at: null
      }
    },
    orderBy: {
      activated_at: 'desc'
    }
  });

  for (const pack of listingPackages) {
    const hasOtherPackages = await listingPackage.count({
      where: {
        listing_id: pack.listing.id,
        paused_at: null,
        active: false,
        activated_at: null,
      }
    })
    if( hasOtherPackages <= 0) {
      if (pack.basic_package && pack.activated_at) {
        let daysToExpire =
          pack.basic_package.duration -
          Math.ceil(-diffToNowInDays(pack.activated_at));
        if (DAYS_TO_EXPIRE_STATIC.includes(daysToExpire)) {
          const notification: any = {
            user_id: pack.listing.user_id,
            scope: UserRoles.USER,
            type: NOTIFICATION_TYPE.LISTING_ABOUT_TO_EXPIRE,
            seen: false,
            title: $ListingExpire.title,
            // message: `Listing ${pack.listing.id} will expire in ${daysToExpire} day${daysToExpire > 1 ? 's' : ''}`
            message: $ListingExpire.message,
            data: {listing: pack.listing.id}
          };
          const notificationId = await notificationServ.create({
            data: notification
          });
          notification.id = notificationId.id;
          notification.created_at = notificationId.created_at;
          notifications.listingAboutToExpire(notification);
          const category = `${pack.listing.subcategory.category.name} > ${pack.listing.subcategory.name}`;
          if (daysToExpire === 6 || daysToExpire === 1 || daysToExpire === 0) ++daysToExpire;
          await sendgrid.listingExpire(pack.listing.user.email, pack.listing.title, category, daysToExpire, pack.listing.images, `${FE_URL}/${FE_DASHBOARD_ENDPOINT}`);
        }
      }
      if (pack.promote_package && pack.activated_at) {      
        let daysToExpire =
          pack.promote_package.duration -
          Math.ceil(-diffToNowInDays(pack.activated_at));
        if (DAYS_TO_EXPIRE_STATIC.includes(daysToExpire)) {
          const notification: any = {
            user_id: pack.listing.user_id,
            scope: UserRoles.USER,
            type: NOTIFICATION_TYPE.LISTING_PROMOTE_ABOUT_TO_EXPIRE,
            seen: false,
            title: $ListingPromoteExpire.title,
            // message: `Listing ${pack.listing.id} promote will expire in ${daysToExpire} day${daysToExpire > 1 ? 's' : ''}`
            message: $ListingPromoteExpire.message,
            data: {listing: pack.listing.id}
          };
          const notificationId = await notificationServ.create({
            data: notification
          });
          notification.id = notificationId.id;
          notification.created_at = notificationId.created_at;
          notifications.listingPromotedAboutToExpire(notification);        
        }
      }
    }
  }
}

listingAboutToExpireChecker()
  .then(() => {
    console.log('Job listingAboutToExpireChecker successfully executed');
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    throw e;
  });
