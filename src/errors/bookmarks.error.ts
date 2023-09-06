import {STATUS_CODES} from '@/constants/statusCodes';
import {createException} from '@/exceptions/HttpException';

export const BOOKMARK_NOT_FOUND = 'bookmark_not_found';
export const bookmarkNotFoundException = createException(
  BOOKMARK_NOT_FOUND,
  STATUS_CODES.CONFLICT
);

export const BOOKMARK_ALREADY_EXISTS = 'already_exists';
export const bookmarkAlreadyExistsException = createException(
  BOOKMARK_ALREADY_EXISTS,
  STATUS_CODES.CONFLICT
);

export const BOOKMARK_UNAUTHORIZED = 'insufficient_permissions';
export const bookmarkUnathorizedException = createException(
  BOOKMARK_UNAUTHORIZED,
  STATUS_CODES.FORBIDDEN
);
