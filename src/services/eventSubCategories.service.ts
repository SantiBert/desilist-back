import {EventSubcategory} from '@prisma/client';
import prisma from '@/db';
import {getISONow} from '@/utils/time';
import {
  EventSubcategoryRequest,
  GetAllEventsSubCategories
} from '@/interfaces/eventSubCategories.interface';
import {LISTING_STATUS} from '@/constants/listingStatus';
import {GetAllEventsDto} from '@/dtos/events.dto';

export class EventSubCategoryService {
  public event_subcategory = prisma.eventSubcategory;
  public events = prisma.event;

  public async create(data: any): Promise<Partial<EventSubcategory> | null> {
    return await this.event_subcategory.create({
      select: {
        id: true
      },
      data
    });
  }

  public async findById(id: number): Promise<Partial<EventSubcategory> | null> {
    return await this.event_subcategory.findUnique({
      select: {
        id: true,
        event_publication_price: true,
        service_fee: true,
        name: true,
        custom_fields: true,
        list_order: true,
        showed_landing: true,
        is_free: true,
        created_at: true,
        updated_at: true,
        category: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      where: {id}
    });
  }

  public async findByName(name: string): Promise<Partial<EventSubcategory>[]> {
    return await this.event_subcategory.findMany({
      select: {
        id: true,
        deleted_at: true
      },
      where: {name}
    });
  }
  public async updateById(
    id: number,
    data: Partial<EventSubcategoryRequest>
  ): Promise<Partial<EventSubcategory> | null> {
    return await this.event_subcategory.update({
      select: {id: true},
      data: {...data, updated_at: getISONow()},
      where: {id}
    });
  }

  public async delete(id: number): Promise<Partial<EventSubcategory> | null> {
    return await this.event_subcategory.update({
      data: {deleted_at: getISONow()},
      where: {id}
    });
  }

  public async find(params?): Promise<GetAllEventsSubCategories> {
    const subCategoriesData = {
      subCategories: [],
      total: 0,
      cursor: 0
    };

    //select
    const select = {
      id: true,
      event_publication_price: true,
      service_fee: true,
      name: true,
      custom_fields: true,
      is_free: true,
      category: {
        select: {
          id: true,
          name: true,
          type: true
        }
      },
      list_order: true,
      showed_landing: true
    };

    //where
    const where = {
      deleted_at: null
    };
    let take = 10;
    if (params) {
      params.category_id
        ? (where['category_id'] = Number(params.category_id))
        : null;
      params.name
        ? (where['name'] = {
            name: {contains: params.name, mode: 'insensitive'}
          })
        : null;
    }

    //take
    if (params?.take) {
      take = Number(params.take);
    }

    //query
    const query = {
      select: select
    };

    //cursor
    if (params?.cursor) {
      query['cursor'] = {
        id: Number(params.cursor)
      };
      query['skip'] = 1;
    }

    if (where) {
      query['where'] = where;
    }

    if (take > 0) {
      query['take'] = take;
    }

    subCategoriesData.subCategories = await this.event_subcategory.findMany(
      query
    );
    //total results
    subCategoriesData.total = await this.event_subcategory.count({
      where: where
    });
    //update lastCursor
    const lastResults =
      subCategoriesData.subCategories[
        subCategoriesData.subCategories.length - 1
      ];
    if (lastResults) {
      subCategoriesData.cursor = lastResults.id;
    }
    //add count events in every subCategory finded
    for await (const subCategory of subCategoriesData.subCategories) {
      const count = await this.events.count({
        where: {
          subcategory_id: subCategory.id,
          deleted_at: null,
          status_id: LISTING_STATUS.ACTIVE
        }
      });
      subCategory._count = {listings: count};
    }

    return subCategoriesData;
  }
}
