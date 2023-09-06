import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function seedEventCategories() {
    const eventCategories = [
        {
            name:"Event",
            type: 2
        }
    ]
    const categories = await prisma.category.findMany({
        where:{
            name:{
               notIn:eventCategories.map(x => x.name)
            } 
        }
    });
    for (const category of categories) {
        await prisma.category.update({
            where: { id: category.id },
            data: { type: 1 },
        });
    }
    for (const eventCategory of eventCategories) {
        await prisma.category.upsert({
            where: {
                name: eventCategory.name
            },
            update: {
                name: eventCategory.name,
                type: eventCategory.type
            },
            create: {
                name: eventCategory.name,
                type: eventCategory.type
            },
          })
    }
}

export default seedEventCategories;
