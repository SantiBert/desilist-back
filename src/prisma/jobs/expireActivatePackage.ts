import {LISTING_STATUS} from '@/constants/listingStatus';
import prisma from '@/db';
import {diffToNowInDays, getISONow} from '../../utils/time';

function isPackageExpired(pack: any, activated_at: any): boolean {
  // uncomment for debug
  // console.log('Basic DiffToNow only: ' + Math.ceil(-diffToNowInDays(activated_at)));
  // console.log('Basic DiffToNow: ' + (pack.duration - Math.ceil(-diffToNowInDays(activated_at))));
  return pack.duration - Math.ceil(-diffToNowInDays(activated_at)) <= 0;
}

function isPromoteExpired(pack: any, promoted_at: any): boolean {
  // uncomment for debug
  // console.log('Promoted DiffToNow only: ' + Math.ceil(-diffToNowInDays(promoted_at)));
  // console.log('Promoted DiffToNow: ' + (pack.duration - Math.ceil(-diffToNowInDays(promoted_at))));
  return pack.duration - Math.ceil(-diffToNowInDays(promoted_at)) <= 0;
}

async function expireActivatePackage(): Promise<void> {
  const listing = prisma.listing;
  const listingPackage = prisma.listingPackage;
  const event = prisma.event;
  const eventPackage = prisma.eventPackage;
  
  const listingPackages = await listingPackage.findMany({
    select: {
      id: true,
      listing: {
        select: {
          id: true,
          user_id: true
        }
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
      activated_at: true,
      promoted_at: true
    },
    where: {
      active: true
    }
  });

  for (const pack of listingPackages) {
    // uncomment for debug
    // console.log(pack.id, ": ", isPackageExpired(pack.basic_package, pack.created_at));
    // console.log(pack.listing.id, ": ", await listingPackage.findFirst({select: {id: true}, where: {listing_id: pack.listing.id, paused_at: null, active: false}, orderBy: {created_at: 'asc'}}));
    if (isPackageExpired(pack.basic_package, pack.activated_at)) {
      // if package is expired set paused time and inactive it
      await listingPackage.update({
        data: {paused_at: getISONow(), active: false},
        where: {id: pack.id}
      });

      // check if the listing has another package to activate
      const newPack = await listingPackage.findFirst({
        select: {id: true},
        where: {listing_id: pack.listing.id, paused_at: null},
        orderBy: {created_at: 'asc'}
      });
      if (newPack) {
        // if there was a package waiting for expiration of the current package, activate it
        await listingPackage.update({
          data: {active: true, activated_at: getISONow()},
          where: {id: newPack.id}
        });
      } else {
        // if there are no packages deactivate the listing
        await listing.update({
          data: {
            status_id: LISTING_STATUS.INACTIVE,
            highlighted: false,
            deactivated_at: getISONow()
          },
          where: {id: pack.listing.id}
        });
      }
    } else {
      if (pack.promoted_at && pack.promote_package) {
        if (isPromoteExpired(pack.promote_package, pack.promoted_at)) {
          await listingPackage.update({
            data: {promote_package_id: null},
            where: {id: pack.id}
          });
          await listing.update({
            data: {
              highlighted: false
            },
            where: {id: pack.listing.id}
          });
        }
      }
    }
  }

  // for events only checks the promotes packages
  const eventPackages = await eventPackage.findMany({
    select: {
      id: true,
      event: {
        select: {
          id: true,
          publisher_id: true
        }
      },
      promote_package: {
        select: {
          id: true,
          duration: true
        }
      },
      created_at: true,
      activated_at: true,
    },
    where: {
      active: true
    }
  })
  for (const eventPack of eventPackages) {
    if (isPackageExpired(eventPack.promote_package, eventPack.activated_at)) {
      // if package is expired set paused time and inactive it
      await eventPackage.update({
        data: {paused_at: getISONow(), active: false},
        where: {id: eventPack.id}
      });

       // check if the listing has another package to activate
       const newPack = await eventPackage.findFirst({
        select: {id: true},
        where: {event_id: eventPack.event.id, paused_at: null},
        orderBy: {created_at: 'asc'}
      });
      if (newPack) {
        // if there was a package waiting for expiration of the current package, activate it
        await eventPackage.update({
          data: {active: true, activated_at: getISONow()},
          where: {id: newPack.id}
        });
      } else {
        // if there are no packages remove highlight from the event
        await event.update({
          data: {
            highlighted: false,
          },
          where: {id: eventPack.event.id}
        });
      }
    }
  }
}

expireActivatePackage()
  .then(() => {
    console.log('Job expireActivatePackage successfully executed');
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    throw e;
  });
