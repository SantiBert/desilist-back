import prisma from '@/db';

export class ZipcodesService {
  public zipCode = prisma.zipCode;

  public async findLocations(code: string): Promise<any | null> {
    return await this.zipCode.findMany({
      select: {
        id: true,
        lat: true,
        lon: true,
        city: {
          select: {
            id: true,
            name: true,
            state: {
              select: {
                id: true,
                name: true,
                abbr: true,
                country: {
                  select: {
                    id: true,
                    name: true,
                    alpha2: true,
                    alpha3: true,
                    iso: true
                  }
                }
              }
            }
          }
        }
      },
      where: {code}
    });
  }
}
