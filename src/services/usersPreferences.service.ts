import {UserPreference} from '@prisma/client';
import prisma from '@/db';

export class UserPreferenceService {
  public userPreference = prisma.userPreference;

  public async find(id: string): Promise<Partial<UserPreference> | null> {
    return await this.userPreference.findUnique({
      select: {user_id: true, unsubscribed: true},
      where: {id}
    });
  }

  public async findByUserId(
    userId: string
  ): Promise<Partial<UserPreference> | null> {
    return await this.userPreference.findUnique({
      select: {id: true, unsubscribed: true},
      where: {user_id: userId}
    });
  }

  public async create(
    data: UserPreference
  ): Promise<Partial<UserPreference> | null> {
    return await this.userPreference.create({select: {id: true}, data});
  }

  public async updateByUserId(
    userId: string,
    data: Partial<UserPreference>
  ): Promise<Partial<UserPreference> | null> {
    return await this.userPreference.update({
      select: {id: true, unsubscribed: true},
      data,
      where: {user_id: userId}
    });
  }

  public async unsubscribe(
    userId: string,
    data: any
  ): Promise<Partial<UserPreference> | null> {
    return await this.userPreference.update({
      select: {id: true, user_id: true, unsubscribed: true},
      data,
      where: {user_id: userId}
    });
  }
}
