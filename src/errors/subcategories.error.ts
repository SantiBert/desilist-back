import {STATUS_CODES} from '@/constants/statusCodes';
import {createException} from '@/exceptions/HttpException';

export const SUBCATEGORY_WITH_ACTIVE_LISTINGS =
  'subcategory_with_active_listings';
export const subcategoryWithActiveListingsException = createException(
  SUBCATEGORY_WITH_ACTIVE_LISTINGS,
  STATUS_CODES.CONFLICT
);

export const SUBCATEGORY_ALREADY_EXISTS = 'subcategory_already_exists';
export const subcategoryAlreadyExistsException = createException(
  SUBCATEGORY_ALREADY_EXISTS,
  STATUS_CODES.CONFLICT
);

export const PRICING_UNDEFINED = 'pricing_undefined';
export const pricingUndefinedException = createException(
  PRICING_UNDEFINED,
  STATUS_CODES.BAD_REQUEST
);
