import {STATUS_CODES} from '@/constants/statusCodes';
import {createException} from '@/exceptions/HttpException';

export const BANNER_NOT_FOUND = 'banner_not_found';
export const bannerNotFoundException = createException(
  BANNER_NOT_FOUND,
  STATUS_CODES.CONFLICT
);

export const BANNER_UNAUTHORIZED = 'insufficient_permissions';
export const bannerUnathorizedException = createException(
  BANNER_UNAUTHORIZED,
  STATUS_CODES.FORBIDDEN
);

export const BANNER_TOO_MANY_IMAGES = 'too_many_images';
export const bannerTooManyImagesException = createException(
  BANNER_TOO_MANY_IMAGES,
  STATUS_CODES.REQUEST_TOO_LONG
);

export const BANNER_CANT_PUBLISH = 'cant_publish';
export const bannerCantPublishException = createException(
  BANNER_CANT_PUBLISH,
  STATUS_CODES.CONFLICT
);
