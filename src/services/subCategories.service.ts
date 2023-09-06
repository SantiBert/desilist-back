import {Subcategory} from '@prisma/client';
import prisma from '@/db';
import {GetAllSubCategories} from '@/interfaces/subCategories.interface';
import {LISTING_STATUS} from '@/constants/listingStatus';

export class SubCategoryService {
  public subcategory = prisma.subcategory;
  public listing = prisma.listing;
  public async find(params?): Promise<GetAllSubCategories> {
    const subCategoriesData = {
      subCategories: [],
      total: 0,
      cursor: 0
    };

    //select
    const select = {
      id: true,
      name: true,
      icon: true,
      image: true,
      free: true,
      category: {
        select: {
          id: true,
          name: true,
          type: true
        }
      },
      order: true,
      landing_show: true
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

    subCategoriesData.subCategories = await this.subcategory.findMany(query);
    //total results
    subCategoriesData.total = await this.subcategory.count({where: where});
    //update lastCursor
    const lastResults =
      subCategoriesData.subCategories[
        subCategoriesData.subCategories.length - 1
      ];
    if (lastResults) {
      subCategoriesData.cursor = lastResults.id;
    }
    //add count listings in every subCategory finded
    for await (const subCategory of subCategoriesData.subCategories) {
      const count = await this.listing.count({
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

  public async findById(id: number): Promise<Partial<Subcategory> | null> {
    return await this.subcategory.findUnique({
      select: {
        id: true,
        name: true,
        icon: true,
        image: true,
        custom_fields: true,
        free: true,
        category: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        _count: {
          select: {
            listings: true
          }
        }
      },
      where: {id}
    });
  }

  public async findByCategoryId(
    id: number
  ): Promise<Partial<Subcategory>[] | null> {
    return await this.subcategory.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
        image: true,
        category: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        _count: {
          select: {
            listings: true
          }
        }
      },
      where: {
        category_id: id
      }
    });
  }
  
  public async findByName(name: string): Promise<Partial<Subcategory>[]> {
    return await this.subcategory.findMany({
      select: {
        id: true,
        deleted_at: true
      },
      where: {name}
    });
  }

  public async create(data: Subcategory): Promise<Partial<Subcategory> | null> {
    return await this.subcategory.create({
      select: {id: true},
      data
    });
  }

  public async updateById(
    id: number,
    data: Partial<Subcategory>
  ): Promise<Partial<Subcategory> | null> {
    return await this.subcategory.update({
      select: {id: true},
      data,
      where: {id}
    });
  }

  public async deleteById(id: number): Promise<void> {
    await this.subcategory.delete({
      where: {id}
    });
  }
}
