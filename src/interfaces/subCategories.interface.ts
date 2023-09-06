import {Subcategory} from '@prisma/client';

export interface GetAllSubCategories {
  subCategories: Subcategory[];
  total: number;
  cursor: number;
}
