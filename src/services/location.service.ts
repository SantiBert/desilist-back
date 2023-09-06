import {Location} from '@prisma/client';
import prisma from '@/db';

export class LocationService {
  public location = prisma.location;
  public zipCode = prisma.zipCode;

  public async find(): Promise<Partial<Location>[]> {
    return await this.location.findMany();
  }

  public async findById(id: number): Promise<Partial<Location> | null> {
    return await this.location.findUnique({where: {id}});
  }

  public async create(data: Location): Promise<Partial<Location> | null> {
    return await this.location.create({select: {id: true}, data});
  }

  public async updateById(
    id: number,
    data: Partial<Location>
  ): Promise<Partial<Location> | null> {
    return await this.location.update({select: {id: true}, where: {id}, data});
  }

  public async updateByUserId(
    userId: string,
    data: Partial<Location>
  ): Promise<Partial<Location> | null> {
    const location = await this.location.findFirst({
      select: {id: true},
      where: {user_id: userId}
    });
    return await this.location.update({
      select: {id: true},
      where: {id: location.id},
      data
    });
  }

  public async findByUserId(
    userId: string
  ): Promise<Partial<Location>[] | null> {
    return await this.location.findMany({
      select: {id: true},
      where: {user_id: userId}
    });
  }

  public async findByZipCode(code: string): Promise<any | null> {
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
