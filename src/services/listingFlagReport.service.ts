import {ListingFlagReport} from '@prisma/client';
import prisma from '@/db';

export class ListingFlagReportService {
  public flagReport = prisma.listingFlagReport;

  public async find(): Promise<Partial<ListingFlagReport>[]> {
    return await this.flagReport.findMany({
      select: {
        id: true,
        user_id: true,
        listing_id: true,
        reason_id: true,
        comment: true
      }
    });
  }

  public async findById(
    id: number
  ): Promise<Partial<ListingFlagReport> | null> {
    return await this.flagReport.findUnique({
      select: {user_id: true, listing_id: true, reason_id: true, comment: true},
      where: {id}
    });
  }

  public async create(
    data: ListingFlagReport
  ): Promise<Partial<ListingFlagReport> | null> {
    return await this.flagReport.create({select: {id: true}, data});
  }

  public async updateById(
    id: number,
    data: Partial<ListingFlagReport>
  ): Promise<Partial<ListingFlagReport> | null> {
    return await this.flagReport.update({
      select: {id: true},
      where: {id},
      data
    });
  }

  public async findByUserId(
    userId: string
  ): Promise<Partial<ListingFlagReport>[] | null> {
    return await this.flagReport.findMany({
      select: {id: true, listing_id: true, reason_id: true, comment: true},
      where: {
        user_id: userId,
        dismissed: false
      }
    });
  }
}
