import {SubcategoryPricing} from '@prisma/client';
import prisma from '@/db';

export class SubcategoriesPricringService {
  public subcategoryPricing = prisma.subcategoryPricing;

  public async findSubcatiegoryPricing(
    subcategoryId: number,
    basicPackageId: number,
    promotePackageId: number
  ): Promise<Partial<SubcategoryPricing>> {
    return await this.subcategoryPricing.findFirst({
      select: {basic_per_day: true, promote_per_day: true},
      where: {
        subcategory_id: subcategoryId,
        basic_pricing_id: basicPackageId,
        promote_pricing_id: promotePackageId
      }
    });
  }

  public async findSubcategoryPricingBasic(
    subcategoryId: number,
    basicPackageId: number
  ): Promise<Partial<SubcategoryPricing>> {
    return await this.subcategoryPricing.findFirst({
      select: {basic_per_day: true},
      where: {
        subcategory_id: subcategoryId,
        basic_pricing_id: basicPackageId
      }
    });
  }

  public async findPricingBySubcategory(
    subcategoryId: number
  ): Promise<Partial<SubcategoryPricing>[]> {
    return await this.subcategoryPricing.findMany({
      select: {
        basic_pricing_package: {select: {id: true, name: true, duration: true}},
        promote_pricing_package: {
          select: {id: true, name: true, duration: true}
        },
        basic_per_day: true,
        promote_per_day: true
      },
      where: {
        subcategory_id: subcategoryId
      },
      orderBy: {
        basic_pricing_package: {
          id: 'asc'
        }
      }
    });
  }

  public async create(data: SubcategoryPricing): Promise<any> {
    return await this.subcategoryPricing.create({
      select: {
        subcategory_id: true,
        basic_pricing_id: true,
        promote_pricing_id: true,
        basic_per_day: true,
        promote_per_day: true
      },
      data
    });
  }

  public async createMany(data: SubcategoryPricing[]): Promise<any> {
    return await this.subcategoryPricing.createMany({
      data,
      skipDuplicates: true
    });
  }

  public async updateById(
    subcategoryId: number,
    basicPricingId: number,
    promotePricingId: number,
    data: Partial<SubcategoryPricing>
  ): Promise<any> {
    return await this.subcategoryPricing.update({
      data,
      where: {
        subcategory_id_basic_pricing_id_promote_pricing_id: {
          subcategory_id: subcategoryId,
          basic_pricing_id: basicPricingId,
          promote_pricing_id: promotePricingId
        }
      }
    });
  }
}
