import {STATUS_CODES} from '@/constants/statusCodes';
import {createException} from '@/exceptions/HttpException';

export const RECAPTCHA_SCORE = 'Recaptcha score not valid';
export const recaptchaScoreException = createException(
  RECAPTCHA_SCORE,
  STATUS_CODES.CONFLICT
);

export const INVALID_RECAPTCHA = 'Invalid Recaptcha';
export const recaptchaException = createException(
  INVALID_RECAPTCHA,
  STATUS_CODES.CONFLICT
);
