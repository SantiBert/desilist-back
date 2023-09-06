import prisma from '@/db';
import {ListingPackage} from '@prisma/client';
import {getISONow} from '@/utils/time';

export class ListingPackageService {
  public listingPackage = prisma.listingPackage;

  public async create(
    data: ListingPackage
  ): Promise<Partial<ListingPackage> | null> {
    return await this.listingPackage.create({
      select: {id: true},
      data
    });
  }

  public async findActivePackage(
    listingId: number
  ): Promise<Partial<ListingPackage> | null> {
    return await this.listingPackage.findFirst({
      select: {id: true},
      where: {listing_id: listingId, active: true}
    });
  }

  public async findById(id: number): Promise<Partial<ListingPackage> | null> {
    return await this.listingPackage.findFirst({
      select: {
        listing_id: true
      },
      where: {
        id
      }
    });
  }

  public async promoteById(
    id: number,
    promotePackageId: number,
    userId: string
  ): Promise<Partial<ListingPackage> | null> {
    return await this.listingPackage.update({
      select: {id: true},
      data: {
        promote_package_id: promotePackageId,
        updated_at: getISONow(),
        updated_by: userId
      },
      where: {id}
    });
  }

  public async cancelPromoteById(
    id: number
  ): Promise<Partial<ListingPackage> | null> {
    return await this.listingPackage.update({
      select: {id: true},
      data: {
        promote_package_id: null
      },
      where: {id}
    });
  }
}
