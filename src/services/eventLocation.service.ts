import {EventLocation} from '@prisma/client';
import prisma from '@/db';
import { EventLocationInterface } from '@/interfaces/eventLocation.interface';

export class EventLocationService {
  public event_location = prisma.eventLocation;

  public async findById(id: number): Promise<Partial<EventLocation> | null> {
    return await this.event_location.findUnique({where: {id}});
  }

  public async create(data: EventLocationInterface): Promise<Partial<EventLocation> | null> {
    return await this.event_location.create({select: {id: true}, data});
  }

  public async updateById(
    id: number,
    data: Partial<EventLocation>
  ): Promise<Partial<EventLocation> | null> {
    return await this.event_location.update({select: {id: true}, where: {id}, data});
  }

  public async findByEvenId(
    eventId: number
  ): Promise<Partial<EventLocation> | null> {
    return await this.event_location.findFirst({
      where: {event_id: eventId}
    });
  }

  public async updateByEventId(
    eventId: number,
    data: Partial<EventLocation>
  ): Promise<Partial<EventLocation> | null> {
    const location = await this.event_location.findFirst({
      select: {id: true},
      where: {event_id: eventId}
    });
    return await this.event_location.update({
      select: {id: true},
      where: {id: location.id},
      data
    });
  }
  
  public async findByEventLatAndLogId(
    eventId: number,
  ): Promise<Partial<any> | null> {
    return await this.event_location.findFirst({
      select: {geometry_point: true},
      where: {event_id: eventId}
    });
  }

  public async deleteById(id: number): Promise<Partial<EventLocation> | null> {
    return await this.event_location.delete({where: {id}});
  }

 /*
  public async findByUserId(
    userId: string
  ): Promise<Partial<Location>[] | null> {
    return await this.location.findMany({
      select: {id: true},
      where: {user_id: userId}
    });
  }*/
}
