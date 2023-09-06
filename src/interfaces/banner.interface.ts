import {Banner} from '@prisma/client';

export interface GetAllBanner {
  banners: Banner[];
  total: number;
  cursor: number;
  pages: number;
}
