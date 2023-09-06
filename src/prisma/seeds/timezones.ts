import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function seedTimezones() {
    const timezones = [
        {
            abbreviation: "EST",
            name:"Eastern Standard Time",
            utc_offset: -5
        },
        {
            abbreviation: "CST",
            name:"Central Standard Time",
            utc_offset: -6
        },
        {
            abbreviation: "MST",
            name:"Mountain Standard Time",
            utc_offset: -7
        },
        {
            abbreviation: "PST",
            name:"Pacific Standard Time",
            utc_offset: -8
        },
    ]
    for (const timezone of timezones) {
        await prisma.timezone.upsert({
            where: {abbreviation: timezone.abbreviation},
            update: {
                abbreviation: timezone.abbreviation,
                name: timezone.name,
                utc_offset: timezone.utc_offset
            },
            create: timezone,
          })
    }
}
export default seedTimezones;
