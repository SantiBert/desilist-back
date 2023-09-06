import {BasicPricingPackage} from '@prisma/client';
import prisma from '@/db';

export class BasicPricingPackageService {
  public basicPricingPackage = prisma.basicPricingPackage;

  public async findAll(): Promise<Partial<BasicPricingPackage>[]> {
    return await this.basicPricingPackage.findMany({
      select: {id: true, name: true, duration: true}
    });
  }

  public async find(id: number): Promise<Partial<BasicPricingPackage>> {
    return await this.basicPricingPackage.findUnique({
      select: {name: true, duration: true},
      where: {
        id
      }
    });
  }
}
