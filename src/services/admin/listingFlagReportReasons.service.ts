import {ListingFlagReportReason} from '@prisma/client';
import prisma from '@/db';

export class ListingFlagReportReasonsService {
  public flagReportReason = prisma.listingFlagReportReason;

  public async find(): Promise<Partial<ListingFlagReportReason>[]> {
    return await this.flagReportReason.findMany({
      select: {
        id: true,
        name: true,
        description: true
      }
    });
  }
}
