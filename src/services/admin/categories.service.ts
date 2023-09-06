import {Category} from '@prisma/client';
import prisma from '@/db';
import {LISTING_STATUS} from '@/constants/listingStatus';

export class CategoryService {
  public category = prisma.category;
  public query = prisma.$queryRaw;

  public async find(): Promise<any> {
    const queryResults = this.findCategoriesQuery();
    return queryResults;
  }

  public async findCategoriesQuery(): Promise<any> {
    return await prisma.$queryRaw`
    SELECT c.id, c.name, COUNT(l.id) as listings, c.order, c.type, COUNT(e.id) as events
    FROM categories c
    LEFT JOIN subcategories s ON (s.category_id = c.id AND s.deleted_at IS NULL)
    LEFT JOIN event_subcategories es ON (es.category_id = c.id AND s.deleted_at IS NULL)
    LEFT JOIN listings l ON (l.subcategory_id = s.id AND 
                             l.deleted_at IS NULL AND 
                             l.status_id = ${LISTING_STATUS.ACTIVE})
    LEFT JOIN events e ON (e.subcategory_id = es.id AND 
                             e.deleted_at IS NULL AND 
                             e.status_id = ${LISTING_STATUS.ACTIVE})
    GROUP BY c.id
    ORDER BY c.order`;
  }

  public async findById(id: number): Promise<Partial<Category> | null> {
    return await this.category.findUnique({
      select: {
        id: true,
        name: true,
        icon: true,
        image: true,
        type: true
      },
      where: {id}
    });
  }

  public async create(data: Category): Promise<Partial<Category> | null> {
    return await this.category.create({
      select: {id: true, name: true},
      data
    });
  }

  public async updateById(
    id: number,
    data: Partial<Category>
  ): Promise<Partial<Category> | null> {
    return await this.category.update({
      select: {id: true},
      data,
      where: {id}
    });
  }

  public async deleteById(id: number): Promise<void> {
    await this.category.delete({
      where: {id}
    });
  }
}
