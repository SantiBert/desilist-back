import {STATUS_CODES} from '@/constants/statusCodes';
import {createException} from '@/exceptions/HttpException';

export const CATEGORY_NOT_FOUND = 'category_not_found';
export const categoryNotFoundException = createException(
  CATEGORY_NOT_FOUND,
  STATUS_CODES.CONFLICT
);
