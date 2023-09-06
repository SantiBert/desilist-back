import {EventOrganizer} from '@prisma/client';
import prisma from '@/db';
import {OrganizerRequest} from '../interfaces/organizer.interface';

export class OrganizerService {

    public organizer = prisma.eventOrganizer;

    public async create(data: EventOrganizer): Promise<Partial<EventOrganizer> | null> {
        return await this.organizer.create({
          select: {
            id: true
          }, data
        });
      }
    public async findById(id: number): Promise<Partial<EventOrganizer> | null> {
      return await this.organizer.findUnique({
        select: {
          id: true,
          organization_name: true,
          hosted_by: true,
          contact_number: true,
        },
        where: {id}
      });
    }
    public async updateById(
      id: number,
      data: Partial<OrganizerRequest>
    ): Promise<Partial<EventOrganizer> | null> {
      return await this.organizer.update({
        select: {id: true},
        data: {...data},
        where: {id}
      });
    }
    public async delete(id: number): Promise<Partial<EventOrganizer> | null>  {
      return await this.organizer.delete({
        where: {id}
      });
    }
}