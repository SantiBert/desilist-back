import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function seedEventMedia() {
    const medias = [
        {
            id:1,
            name:"Discord",
        },
        {
            id:2,
            name:"Facebook",
        },
        {
            id:3,
            name:"Instagram",
        },
        {
            id:4,
            name:"Twitch",
        },
        {
            id:5,
            name:"Youtube",
        },
        {
            id:6,
            name:"Zoom",
        },
    ]
    for (const media of medias) {
        await prisma.media.upsert({
            where: {
                id: media.id
            },
            update: {
                name: media.name,
            },
            create: {
                name: media.name
            },
          })
    }
}
export default seedEventMedia;
