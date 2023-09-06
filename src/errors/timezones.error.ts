import {STATUS_CODES} from '@/constants/statusCodes';
import {createException} from '@/exceptions/HttpException';

export const TIMEZONE_NOT_FOUND = 'timezone_not_found';
export const timezoneNotFoundException = createException(
  TIMEZONE_NOT_FOUND,
  STATUS_CODES.NOT_FOUND
);
