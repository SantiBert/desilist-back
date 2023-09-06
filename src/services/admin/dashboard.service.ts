import prisma from '@/db';
import {UserRoles, UserStatus} from '@/constants';
import {LISTING_STATUS} from '@/constants/listingStatus';

export class AdminDashboardService {
  public user = prisma.user;
  public category = prisma.category;

  public async countUsers(): Promise<any> {
    return await this.user.count({
      where: {
        status_id: UserStatus.ACTIVE,
        role_id: UserRoles.USER,
        deleted_at: null
      }
    });
  }

  public async findCategories(): Promise<any> {
    return this.findCategoriesQuery();
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
}
