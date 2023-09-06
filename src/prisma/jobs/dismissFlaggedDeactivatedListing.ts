import {LISTING_STATUS} from '@/constants/listingStatus';
import prisma from '@/db';
import {DateTime} from 'luxon';

async function dismissFlaggedDeactivatedListing(): Promise<void> {
  const listing = prisma.listing;
  const listingFlagged = prisma.listingFlagged;
  const listingReports = prisma.listingFlagReport;

  
  const conditionDate = await DateTime.now().minus({days: 30}).toISO();

  // Listings Flagged
  const listingsFlagged = await listingFlagged.findMany({
    select:{
        id: true,
    },
    where: {
        // uncomment next line if want to delete all Flag records
        // dismissed: false,
        listing: {
            status_id: LISTING_STATUS.INACTIVE,
            deactivated_at: {
                lte: conditionDate
            }
            
        }
    }
  });
  const flagsToDelete = listingsFlagged.map((flag) => flag.id);
  await listingFlagged.deleteMany({
    where: {
        id: {
            in: flagsToDelete
        }
    }
  })

  // Listings Reported
  const listingsFlagReports = await listingReports.findMany({
    select:{
        id: true,
    },
    where: {
        listing: {
            status_id: LISTING_STATUS.INACTIVE,
            deactivated_at: {
                lte: conditionDate
            }
        }
    }
  });
  const reportsToDismiss = listingsFlagReports.map((report) => report.id);
  await listingFlagged.updateMany({
    data: {
      dismissed: true
    },
    where: {
        id: {
            in: reportsToDismiss
        }
    }
  })
  }

dismissFlaggedDeactivatedListing()
  .then(() => {
    console.log('Job dismissFlaggedDeactivatedListings successfully executed');
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    throw e;
  });
