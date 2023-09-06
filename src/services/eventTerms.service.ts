import {EventTerms} from '@prisma/client';
import prisma from '@/db';
import {EventTermsRequest} from '@/interfaces/desilistTerms.interface';

export class EventTermsService {
  public event_terms = prisma.eventTerms;

  public async create(
    data: EventTermsRequest
  ): Promise<Partial<EventTerms> | null> {
    return await this.event_terms.create({
      select: {
        id: true
      },
      data
    });
  }

  public async findById(id: number): Promise<Partial<EventTerms> | null> {
    return await this.event_terms.findUnique({
      select: {
        id: true,
        term: true
      },
      where: {id}
    });
  }
  public async updateById(
    id: number,
    data: EventTermsRequest
  ): Promise<Partial<EventTerms> | null> {
    return await this.event_terms.update({
      select: {id: true},
      data: {...data},
      where: {id}
    });
  }

  public async delete(id: number): Promise<Partial<EventTerms> | null> {
    return await this.event_terms.delete({
      where: {id}
    });
  }
}
