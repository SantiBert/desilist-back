import {STATUS_CODES} from '@/constants/statusCodes';
import {createException} from '@/exceptions/HttpException';

export const LISTING_PACKAGE_NOT_FOUND = 'listing_package_not_found';
export const listingPackageNotFoundException = createException(
  LISTING_PACKAGE_NOT_FOUND,
  STATUS_CODES.CONFLICT
);

export const LISTING_PACKAGE_UNAUTHORIZED = 'insufficient_permissions';
export const listingPackageUnathorizedException = createException(
  LISTING_PACKAGE_UNAUTHORIZED,
  STATUS_CODES.FORBIDDEN
);

export const SUBCATEGORY_NOT_FREE = 'subcategory_not_free';
export const subcategoryNotFreeException = createException(
  SUBCATEGORY_NOT_FREE,
  STATUS_CODES.CONFLICT
);

export const PROMOTE_NOT_FREE = 'promote_not_free';
export const promoteNotFreeException = createException(
  PROMOTE_NOT_FREE,
  STATUS_CODES.CONFLICT
);

export const ALREADY_ACTIVE_PACKAGE = 'already_active_package';
export const alreadyActivePackageException = createException(
  ALREADY_ACTIVE_PACKAGE,
  STATUS_CODES.CONFLICT
);

export const FREE_PACKAGE_MISSMATCH = 'not_validate_package';
export const freePackageMissmatchException = createException(
  FREE_PACKAGE_MISSMATCH,
  STATUS_CODES.CONFLICT
);
