import {EventFlagReport} from '@prisma/client';
import prisma from '@/db';

export class EventFlagReportService {
  public flagReport = prisma.eventFlagReport;

  public async find(): Promise<Partial<EventFlagReport>[]> {
    return await this.flagReport.findMany({
      select: {
        id: true,
        user_id: true,
        event_id: true,
        reason_id: true,
        explanation: true,
        dismissed:true
      }
    });
  }

  public async findById(
    id: number
  ): Promise<Partial<EventFlagReport> | null> {
    return await this.flagReport.findUnique({
      select: {user_id: true, event_id: true, reason_id: true, explanation: true,dismissed:true},
      where: {id}
    });
  }

  public async create(
    data: EventFlagReport
  ): Promise<Partial<EventFlagReport> | null> {
    return await this.flagReport.create({select: {id: true}, data});
  }

  public async updateById(
    id: number,
    data: Partial<EventFlagReport>
  ): Promise<Partial<EventFlagReport> | null> {
    return await this.flagReport.update({
      select: {id: true},
      where: {id},
      data
    });
  }

  public async findByUserId(
    userId: string
  ): Promise<Partial<EventFlagReport>[] | null> {
    return await this.flagReport.findMany({
      select: {id: true, event_id: true, reason_id: true, explanation: true, dismissed:true},
      where: {
        user_id: userId,
        dismissed: false
      }
    });
  }
}
