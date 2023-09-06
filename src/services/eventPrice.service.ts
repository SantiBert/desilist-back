import {EventPrice} from '@prisma/client';
import prisma from '@/db';
import {getISONow} from '@/utils/time';
import {EventPriceRequest} from '@/interfaces/eventPrice.interface';

export class EventPriceService {
  public event_price = prisma.eventPrice;

  public async findSubcategoryPricing(
    subcategoryId: number,
    promotePackageId: number
  ): Promise<Partial<EventPrice>> {
    return await this.event_price.findFirst({
      select: {
        event_subcategory: {
          select: {
            service_fee: true
          }
        },
        promote_per_day: true
      },
      where: {
        event_subcategory_id: subcategoryId,
        promote_pricing_id: promotePackageId
      }
    });
  }

  public async findPricingBySubcategory(
    subcategoryId: number
  ): Promise<Partial<EventPrice>[]> {
    return await this.event_price.findMany({
      select: {
        promote_pricing: {
          select: {
            id: true,
            name: true
          }
        },
        promote_per_day: true
      },
      where: {
        event_subcategory_id: subcategoryId
      },
      orderBy: {
        promote_pricing: {
          id: 'asc'
        }
      }
    });
  }

  public async create(data: EventPrice): Promise<any> {
    return await this.event_price.create({
      select: {
        event_subcategory_id: true,
        promote_pricing_id: true,
        promote_per_day: true
      },
      data
    });
  }

  public async createMany(data: EventPrice[]): Promise<any> {
    return await this.event_price.createMany({
      data,
      skipDuplicates: true
    });
  }

  public async updateById(
    subcategoryId: number,
    promotePricingId: number,
    data: Partial<EventPrice>
  ): Promise<any> {
    return await this.event_price.update({
      data,
      where: {
        event_subcategory_id_promote_pricing_id: {
          event_subcategory_id: subcategoryId,
          promote_pricing_id: promotePricingId
        }
      }
    });
  }
}
