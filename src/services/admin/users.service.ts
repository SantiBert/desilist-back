import prisma from '@/db';
import {GetAllUsers} from '@/interfaces/users.interface';

export class AdminUserService {
  public user = prisma.user;

  public async find(params?): Promise<GetAllUsers> {
    const usersData = {
      users: [],
      total: 0,
      cursor: 0,
      pages: 0
    };
    //select
    const select = {
      id: true,
      email: true,
      status_id: true
    };
    // where
    const where = {deleted_at: null};
    const subWhere = [];
    let take = 10;
    if (params) {
      params.status_id ? (where['status_id'] = Number(params.status_id)) : null;
      params.role_id ? (where['role_id'] = Number(params.role_id)) : null;
      if (params.search) {
        subWhere.push({
          full_name: {contains: params.search, mode: 'insensitive'}
        });
        subWhere.push({email: {contains: params.search, mode: 'insensitive'}});
      }
      subWhere.length > 0 ? (where['OR'] = subWhere) : null;
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
    if (params?.cursor && !params.skip) {
      query['cursor'] = {
        id: Number(params.cursor)
      };
      query['skip'] = 1;
    }
    //skip
    if (params?.skip && !params.cursor) {
      query['skip'] = Number(params.skip);
    }
    /*******/
    if (where) {
      query['where'] = where;
    }
    if (take > 0) {
      query['take'] = take;
    }
    let order,
      criteria = 'id';
    if (params?.order) {
      order = params.order;
    }
    if (params?.order_by) {
      criteria = params.order_by;
    }
    query['orderBy'] = {
      [criteria]: order ? order : 'desc'
    };

    usersData.users = await this.user.findMany(query);
    //total results
    usersData.total = await this.user.count({where: where});
    //total pages
    usersData.pages = Math.ceil(Number(usersData.total / take));
    //update lastCursor
    const lastResults = usersData.users[usersData.users.length - 1];
    if (lastResults) {
      usersData.cursor = lastResults.id;
    }

    return usersData;
    /*
    return await this.user.findMany({
      select: {}
    });
    */
  }
}
