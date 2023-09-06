import {Notification} from '@prisma/client';
import prisma from '@/db';
import { Json } from 'aws-sdk/clients/robomaker';

export class NotificationService {
  public notification = prisma.notification;

  public async findNotificationById(
    id: number
  ): Promise<Partial<Notification> | null> {
    return await this.notification.findUnique({
      select: {
        user_id: true,
        scope: true,
        type: true,
        seen: true,
        message: true,
        data: true
      },
      where: {id}
    });
  }

  public async findNotificationByUserId(
    userId: string
  ): Promise<Partial<Notification>[]> {
    return await this.notification.findMany({
      select: {
        id: true,
        scope: true,
        type: true,
        seen: true,
        message: true,
        data: true
      },
      where: {user_id: userId}
    });
  }

  public async findUnreadNotificationByUserId(
    userId: string
  ): Promise<Partial<Notification>[]> {
    return await this.notification.findMany({
      select: {
        id: true,
        scope: true,
        type: true,
        seen: true,
        title: true,
        message: true,
        created_at: true,
        data: true
      },
      where: {user_id: userId, seen: false},
      orderBy: {
        created_at: 'desc'
      },
      take: 10
    });
  }

  public async findNotificationByType(
    type: string,
    data:any
  ): Promise<Partial<Notification> | null> {
    return await this.notification.findFirst({
      select: {
        user_id: true,
        scope: true,
        type: true,
        seen: true,
        message: true,
        data: true
      },
      where: {
        type:type,
        data:{
          equals:data
        }
      }
    });
  }

  public async create(
    data: Notification
  ): Promise<Partial<Notification> | null> {
    return await this.notification.create({
      select: {
        id: true,
        created_at: true
      },
      data
    });
  }

  public async update(
    id: number,
    data: Partial<Notification>
  ): Promise<Partial<Notification> | null> {
    return await this.notification.update({
      select: {id: true},
      where: {id},
      data
    });
  }

  public async updateByUserId(
    userId: string,
    data: Partial<Notification>
  ): Promise<any> {
    return await this.notification.updateMany({
      where: {user_id: userId},
      data
    });
  }

  public async setToRead(id: number): Promise<Partial<Notification> | null> {
    return await this.notification.update({
      select: {id: true},
      where: {id},
      data: {seen: true}
    });
  }

  public async setToReadByUserId(userId: string): Promise<any> {
    return await this.notification.updateMany({
      where: {user_id: userId},
      data: {seen: true}
    });
  }

  public async deleteById(id: number): Promise<void> {
    await this.notification.delete({where: {id}});
  }

  public async deleteByUserId(userId: string): Promise<void> {
    await this.notification.deleteMany({
      where: {user_id: userId}
    });
  }
}
