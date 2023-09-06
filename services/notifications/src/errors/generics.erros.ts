import {STATUS_CODES} from '@/constants/statusCodes';
import {createException} from '@/exceptions/HttpException';

export const INVALID_VERSION_FORMAT = 'invalid_version_format';
export const invalidVersionFormatException = createException(
  INVALID_VERSION_FORMAT,
  STATUS_CODES.BAD_REQUEST
);

export const VALIDATION_ERROR = 'validation_error';
export const validationErrorException = createException(
  VALIDATION_ERROR,
  STATUS_CODES.BAD_REQUEST
);

export const GENERIC_ERROR = 'generic_error';
export const genericErrorException = createException(
  GENERIC_ERROR,
  STATUS_CODES.CONFLICT
);

export const TOO_MANY_REQUESTS_ERROR = 'too_many_requests_error';
export const tooManyRequestsErrorException = createException(
  TOO_MANY_REQUESTS_ERROR,
  STATUS_CODES.TOO_MANY_REQUESTS
);
