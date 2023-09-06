import {STATUS_CODES} from '@/constants/statusCodes';
import {createException} from '@/exceptions/HttpException';

export const LISTING_NOT_FOUND = 'listing_not_found';
export const listingNotFoundException = createException(
  LISTING_NOT_FOUND,
  STATUS_CODES.CONFLICT
);

export const LISTING_UNAUTHORIZED = 'insufficient_permissions';
export const listingUnathorizedException = createException(
  LISTING_UNAUTHORIZED,
  STATUS_CODES.FORBIDDEN
);

export const LISTING_TOO_MANY_IMAGES = 'too_many_images';
export const listingTooManyImagesException = createException(
  LISTING_TOO_MANY_IMAGES,
  STATUS_CODES.REQUEST_TOO_LONG
);

export const LISTING_CANT_PUBLISH = 'cant_publish';
export const listingCantPublishException = createException(
  LISTING_CANT_PUBLISH,
  STATUS_CODES.CONFLICT
);

export const LISTING_WITHOUT_ACTIVE_PACKAGE = 'no_active_package';
export const listingWithoutActivePackageException = createException(
  LISTING_WITHOUT_ACTIVE_PACKAGE,
  STATUS_CODES.CONFLICT
);

export const INVALID_REASONS = 'invalid_flag_reasons';
export const invalidFlagReasonsException = createException(
  INVALID_REASONS,
  STATUS_CODES.CONFLICT
);

export const FLAG_ALREADY_REPORTED = 'listing_already_reported';
export const listingAlreadyReportedException = createException(
  FLAG_ALREADY_REPORTED,
  STATUS_CODES.CONFLICT
);
