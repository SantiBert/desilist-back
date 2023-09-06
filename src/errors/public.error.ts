import {STATUS_CODES} from '@/constants/statusCodes';
import {createException} from '@/exceptions/HttpException';

export const LOCATION_NOT_FOUND = 'location_not_found';
export const locationNotFoundException = createException(
  LOCATION_NOT_FOUND,
  STATUS_CODES.NOT_FOUND
);
