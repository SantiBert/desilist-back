import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function seedDesilistTermsAndConditions() {
    const termsAndConditions = [
        {
            id:1,
            term_description:"The ticket prices for this event are $[price].",
        },
        {
            id:2,
            term_description:"All ticket sales are final. No refunds will be issued. Please note that the processing fee charged by Desilist is non-refundable.",
        },
        {
            id:3,
            term_description:"A processing fee of $[price] will be added to the ticket price.",
        },
        {
            id:4,
            term_description:"Attendees participate at their own risk. Desilist is not responsible for any accidents, injuries, or damages that may occur during the event.",
        },
        {
            id:5,
            term_description:"Any content or materials shared during the event, such as presentations or performances, are the intellectual property of their respective owners.",
        },
    ]
    for (const term of termsAndConditions) {
        await prisma.desilistTerms.upsert({
            where: {
                id: term.id
            },
            update: {
                term_description: term.term_description,
            },
            create: {
                term_description: term.term_description
            },
          })
    }
}
export default seedDesilistTermsAndConditions;
