import {getISONow} from '@/utils/time';
import {User} from '@prisma/client';
import prisma from '@/db';
import {UserRoles, UserStatus} from '@/constants';
import {LISTING_STATUS} from '@/constants/listingStatus';

export class UserService {
  public user = prisma.user;

  public async findById(id: string): Promise<Partial<User> | null> {
    return await this.user.findFirst({
      select: {
        email: true,
        full_name: true,
        phone_number: true,
        status_id: true,
        bio: true,
        photo: true,
        location: true,
        listings: {
          select: {id: true},
          where: {
            deleted_at: null,
            status_id: {
              notIn: [LISTING_STATUS.DRAFT]
            }
          }
        },
        created_at: true,
        photo_json: true // todo: remove this prop
      },
      where: {
        id,
        deleted_at: null,
        status_id: {
          notIn: [UserStatus.BLOCKED, UserStatus.INACTIVE]
        }
      }
    });
  }

  public async findByEmail(email: string): Promise<Partial<User> | null> {
    return await this.user.findUnique({
      select: {id: true, phone_number: true, status_id: true, deleted_at: true},
      where: {
        email
      }
    });
  }

  // to recover user data from id inside jwt
  public async findCurrent(id: string): Promise<Partial<User> | null> {
    return await this.user.findUnique({
      select: {
        email: true,
        phone_number: true,
        role_id: true,
        status_id: true,
        bio: true,
        full_name: true,
        photo: true,
        alternative_email: true,
        location: {
          select: {
            country: true,
            zip_code: true,
            city: true,
            state: true
          }
        },
        photo_json: true // todo: remove this prop
      },
      where: {id}
    });
  }

  public async findAdmins(): Promise<Partial<User>[]> {
    return await this.user.findMany({
      select: {id: true, email: true},
      where: {role_id: UserRoles.ADMIN}
    });
  }

  public async findUserProfile(id: string): Promise<Partial<User>> {
    return await this.user.findUnique({
      select: {
        full_name: true,
        bio: true,
        photo: true,
        photo_json: true,
        phone_number: true,
        location: {
          select: {country: true, state: true, city: true, zip_code: true}
        }
      },
      where: {id}
    });
  }

  public async create(data: User): Promise<Partial<User> | null> {
    return await this.user.create({select: {id: true, email: true}, data});
  }

  public async updateById(
    id: string,
    data: Partial<User>
  ): Promise<Partial<User> | null> {
    return await this.user.update({
      select: {id: true, email: true},
      data: {...data, updated_at: getISONow()},
      where: {id}
    });
  }

  public async deleteById(id: string): Promise<void> {
    await this.user.update({data: {deleted_at: getISONow()}, where: {id}});
  }

  public async disableById(id: string): Promise<void> {
    await this.user.update({
      data: {status_id: UserStatus.DISABLED},
      where: {id}
    });
  }

  public async isUserDeleted(email: string): Promise<boolean> {
    const user = await this.user.findUnique({
      select: {deleted_at: true},
      where: {email}
    });
    return user.deleted_at ? true : false;
  }
}
