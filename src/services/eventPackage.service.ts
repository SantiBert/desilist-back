import prisma from '@/db';
import {EventPackage} from '@prisma/client';
import {getISONow} from '@/utils/time';

export class EventPackageService {
  public eventPackage = prisma.eventPackage;

  public async find(id: number): Promise<Partial<EventPackage>> {
    return await this.eventPackage.findUnique({
      select: {
        id: true,
        event_id: true,
        promote_package_id: true,
        active: true,
        created_at: true,
        activated_at: true
      },
      where: {id}
    });
  }

  public async findExistingPackage(
    promotePackageId: number,
    listingId: number
  ): Promise<Partial<EventPackage>> {
    return await this.eventPackage.findFirst({
      select: {id: true},
      where: {
        promote_package_id: promotePackageId,
        event_id: listingId,
        active: true
      }
    });
  }

  public async findActivePackage(
    eventId: number
  ): Promise<Partial<EventPackage>> {
    return await this.eventPackage.findFirst({
      select: {id: true},
      where: {
        event_id: eventId, 
        active: true,
        paused_at: null
      }
    });
  }

  public async create(data: EventPackage): Promise<Partial<EventPackage>> {
    return await this.eventPackage.create({select: {id: true}, data});
  }

  public async update(data: EventPackage): Promise<Partial<EventPackage>> {
    return await this.eventPackage.create({select: {id: true}, data});
  }

  public async updateById(
    id: number,
    data: Partial<EventPackage>
  ): Promise<Partial<EventPackage> | null> {
    return await this.eventPackage.update({
      select: {id: true},
      data,
      where: {id}
    });
  }

  public async promoteById(
    id: number,
    promotePackageId: number,
    userId: string
  ): Promise<Partial<EventPackage>> {
    return await this.eventPackage.update({
      data: {
        promote_package_id: promotePackageId,
        updated_at: getISONow(),
        updated_by: userId
      },
      where: {id}
    });
  }
}
