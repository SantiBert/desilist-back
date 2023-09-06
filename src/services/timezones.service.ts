import {Timezone} from '@prisma/client';
import prisma from '@/db';

export class TimezoneService {

    public timezone = prisma.timezone;

    public async find(): Promise<Partial<Timezone>[]> {
      return await this.timezone.findMany();
    }
    public async findById(id: number): Promise<Partial<Timezone> | null> {
      return await this.timezone.findUnique({
        select: {
          id: true,
          abbreviation: true,
          name: true,
          utc_offset: true
        },
        where: {id}
      });
    }
}