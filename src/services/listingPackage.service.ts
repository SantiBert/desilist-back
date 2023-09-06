import prisma from '@/db';
import {ListingPackage} from '@prisma/client';
import {getISONow} from '@/utils/time';

export class ListingPackageService {
  public listingPackage = prisma.listingPackage;

  public async find(id: number): Promise<Partial<ListingPackage>> {
    return await this.listingPackage.findUnique({
      select: {
        id: true,
        listing_id: true,
        basic_package_id: true,
        promote_package_id: true,
        active: true,
        created_at: true,
        activated_at: true
      },
      where: {id}
    });
  }

  public async findExistingPackage(
    basicPackageId: number,
    listingId: number
  ): Promise<Partial<ListingPackage>> {
    return await this.listingPackage.findFirst({
      select: {id: true},
      where: {
        basic_package_id: basicPackageId,
        listing_id: listingId,
        active: true
      }
    });
  }

  public async findActivePackage(
    listingId: number
  ): Promise<Partial<ListingPackage>> {
    return await this.listingPackage.findFirst({
      select: {id: true},
      where: {listing_id: listingId, active: true}
    });
  }

  public async create(data: ListingPackage): Promise<Partial<ListingPackage>> {
    return await this.listingPackage.create({select: {id: true}, data});
  }

  public async update(data: ListingPackage): Promise<Partial<ListingPackage>> {
    return await this.listingPackage.create({select: {id: true}, data});
  }

  public async updateById(
    id: number,
    data: Partial<ListingPackage>
  ): Promise<Partial<ListingPackage> | null> {
    return await this.listingPackage.update({
      select: {id: true},
      data,
      where: {id}
    });
  }

  public async promoteById(
    id: number,
    promotePackageId: number,
    userId: string
  ): Promise<Partial<ListingPackage>> {
    return await this.listingPackage.update({
      data: {
        promote_package_id: promotePackageId,
        updated_at: getISONow(),
        updated_by: userId
      },
      where: {id}
    });
  }
}
