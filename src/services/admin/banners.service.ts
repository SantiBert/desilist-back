import {Banner} from '@prisma/client';
import prisma from '@/db';
import {GetAllBanner} from '../../interfaces/banner.interface';
import {getISONow} from '@/utils/time';
export class BannerService {
  public banner = prisma.banner;

  public async findAdmin(params?): Promise<Partial<GetAllBanner>> {
    const bannerData = {
      banners: [],
      total: 0,
      cursor: 0,
      pages: 0
    };
    //select
    const select = {
      id: true,
      user: {
        select: {
          id: true,
          full_name: true,
          photo: true,
          photo_json: true
        }
      },
      name: true,
      link: true,
      price: true,
      desktop_image: true,
      mobile_image: true,
      category: {
        select: {
          id: true,
          name: true
        }
      },
      banner_type: true,
      source: true,
      paused: true,
      created_at: true,
      updated_at: true
    };

    //where
    const where = {deleted_at: null};
    const subWhere = [];
    let take = 10;
    if (params) {
      params.category_id
        ? (where['category_id'] = Number(params.category_id))
        : null;
      params.active ? (where['paused'] = false) : null;
      params.source ? (where['source'] = params.source) : null;
      params.banner_type ? (where['banner_type'] = params.banner_type) : null;
      subWhere.length > 0 ? (where['OR'] = subWhere) : null;
    }

    //take
    if (params.take) {
      take = Number(params.take);
    }

    //query
    const query = {
      select: select
    };

    //cursor
    if (params.cursor && !params.skip) {
      query['cursor'] = {
        id: Number(params.cursor)
      };
      query['skip'] = 1;
    }

    //skip
    if (params.skip && !params.cursor) {
      query['skip'] = Number(params.skip);
    }

    if (where) {
      query['where'] = where;
    }

    if (take > 0) {
      query['take'] = take;
    }

    let order;
    if (params.order) {
      order = params.order;
    }
    query['orderBy'] = {
      id: order ? order : 'desc'
    };

    bannerData.banners = await this.banner.findMany(query);
    //total results
    bannerData.total = await this.banner.count({where: where});
    //total pages
    bannerData.pages = Math.ceil(Number(bannerData.total / take));
    //update lastCursor
    const lastResults = bannerData.banners[bannerData.banners.length - 1];
    if (lastResults) {
      bannerData.cursor = lastResults.id;
    }

    return bannerData;
  }

  public async find(params?): Promise<Partial<GetAllBanner>> {
    const bannerData = {
      banners: [],
      total: 0,
      cursor: 0,
      pages: 0
    };
    //select
    const select = {
      id: true,
      user: {
        select: {
          id: true,
          full_name: true,
          photo: true,
          photo_json: true
        }
      },
      name: true,
      link: true,
      price: true,
      desktop_image: true,
      mobile_image: true,
      category: {
        select: {
          id: true,
          name: true
        }
      },
      banner_type: true,
      source: true,
      paused: true,
      created_at: true,
      updated_at: true
    };

    //where
    const where = {deleted_at: null, paused: false};
    const subWhere = [];
    let take = 10;
    if (params) {
      params.category_id
        ? (where['category_id'] = Number(params.category_id))
        : null;
      params.active ? (where['paused'] = false) : null;
      params.source ? (where['source'] = params.source) : null;
      params.banner_type ? (where['banner_type'] = params.banner_type) : null;
      subWhere.length > 0 ? (where['OR'] = subWhere) : null;
    }

    //take
    if (params.take) {
      take = Number(params.take);
    }

    //query
    const query = {
      select: select
    };

    //cursor
    if (params.cursor && !params.skip) {
      query['cursor'] = {
        id: Number(params.cursor)
      };
      query['skip'] = 1;
    }

    //skip
    if (params.skip && !params.cursor) {
      query['skip'] = Number(params.skip);
    }

    if (where) {
      query['where'] = where;
    }

    if (take > 0) {
      query['take'] = take;
    }

    let order;
    if (params.order) {
      order = params.order;
    }
    query['orderBy'] = {
      id: order ? order : 'desc'
    };

    bannerData.banners = await this.banner.findMany(query);
    //total results
    bannerData.total = await this.banner.count({where: where});
    //total pages
    bannerData.pages = Math.ceil(Number(bannerData.total / take));
    //update lastCursor
    const lastResults = bannerData.banners[bannerData.banners.length - 1];
    if (lastResults) {
      bannerData.cursor = lastResults.id;
    }

    return bannerData;
  }

  public async findById(id: number): Promise<Partial<Banner> | null> {
    return await this.banner.findUnique({
      select: {
        id: true,
        user: {
          select: {
            id: true,
            full_name: true
          }
        },
        name: true,
        link: true,
        price: true,
        desktop_image: true,
        mobile_image: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        banner_type: true,
        source: true,
        paused: true,
        created_at: true
      },
      where: {id}
    });
  }

  public async create(data: Banner): Promise<Partial<Banner> | null> {
    return await this.banner.create({
      select: {id: true, banner_type: true, category_id: true},
      data
    });
  }

  public async updateById(
    id: number,
    data: Partial<Banner>
  ): Promise<Partial<Banner> | null> {
    return await this.banner.update({
      select: {id: true},
      data: {...data, updated_at: getISONow()},
      where: {id}
    });
  }

  public async deleteById(id: number): Promise<void> {
    await this.banner.update({data: {deleted_at: getISONow()}, where: {id}});
  }

  public async deleteByUserId(userId: string): Promise<void> {
    await this.banner.updateMany({
      data: {deleted_at: getISONow()},
      where: {user_id: userId}
    });
  }
}
