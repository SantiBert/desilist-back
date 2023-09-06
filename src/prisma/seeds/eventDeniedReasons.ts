import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function seedEventDeniedReasons() {
    const reasons = [
        {
            id:1,
            name:"Incomplete",
        },
        {
            id:2,
            name:"Inappropriate content",
        },
        {
            id:3,
            name:"Duplicate",
        },
        {
            id:4,
            name:"Other",
        },
    ]
    for (const reason of reasons) {
        await prisma.deniedReasons.upsert({
            where: {
                id: reason.id
            },
            update: {
                name: reason.name,
            },
            create: {
                name: reason.name
            },
          })
    }
}
export default seedEventDeniedReasons;
