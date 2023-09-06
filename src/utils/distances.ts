import { PrismaClient } from '@prisma/client';
import config from '@/config';

const prisma = new PrismaClient();

interface Location {
  lat: number;
  lng: number;
}

export async function getDistance(main_location:Location,event_location:Location): Promise<any> {
  try {
    const point1 = `POINT(${main_location.lng} ${main_location.lat})`;
    const point2 = `POINT(${event_location.lng} ${event_location.lat})`;
    let close = false

    const result = await prisma.$queryRaw`
    SELECT ST_Distance(
      ST_Transform(ST_GeomFromText(${point1}, 4326), 5072),
      ST_Transform(ST_GeomFromText(${point2}, 4326), 5072)
    ) AS distance;
  `;

    const distance = result[0].distance;

    const maximumDistance = config.attendance.maximumDistance;

    if (distance  <= maximumDistance){
      close = true
    }

    return close;

  } catch (error) {
    throw new Error('Cannot calculate distance with the data provided');
  }
}
