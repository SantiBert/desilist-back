import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function seedTicketCategories() {
    const ticketCategories = [
        {
            id:1,
            name:"PAID",
        },
        {
            id:2,
            name:"FREE",
        },
    ]
    for (const ticketCategory of ticketCategories) {
        await prisma.ticketCategory.upsert({
            where: {
                id: ticketCategory.id
            },
            update: {
                name: ticketCategory.name,
            },
            create: {
                name: ticketCategory.name
            },
          })
    }
}
export default seedTicketCategories;
