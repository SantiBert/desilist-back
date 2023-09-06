import {PromotePricingPackage} from '@prisma/client';
import prisma from '@/db';

export class PromotePricingPackageService {
  public promotePricingPackage = prisma.promotePricingPackage;

  public async findAll(): Promise<Partial<PromotePricingPackage>[]> {
    return await this.promotePricingPackage.findMany({
      select: {id: true, name: true, duration: true}
    });
  }

  public async find(id: number): Promise<Partial<PromotePricingPackage>> {
    return await this.promotePricingPackage.findUnique({
      select: {name: true, duration: true},
      where: {
        id
      }
    });
  }
}
