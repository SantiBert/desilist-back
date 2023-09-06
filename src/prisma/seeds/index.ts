import { PrismaClient } from '@prisma/client'
import seedTimezones from './timezones'
import seedEventMedia from './media';
import seedEventCategories from './eventCategories';
import seedEventSubCategories from './eventSubCategories';
import seedTicketCategories from './ticketCategory';
import seedDesilistTermsAndConditions from './desilistTermsAndConditions';
import seedEventDeniedReasons from './eventDeniedReasons';
const prisma = new PrismaClient()
async function seeds() {
    await seedTimezones();
    await seedEventCategories();
    await seedEventMedia();
    await seedTicketCategories();
    await seedEventSubCategories();
    await seedDesilistTermsAndConditions();
    await seedEventDeniedReasons();
}
seeds()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })