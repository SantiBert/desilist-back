import {STATUS_CODES} from '@/constants/statusCodes';
import {createException} from '@/exceptions/HttpException';

export const CUSTOMER_ALREADY_EXISTS = 'customer_already_exists';
export const customerAlreadyExistsException = createException(
  CUSTOMER_ALREADY_EXISTS,
  STATUS_CODES.CONFLICT
);

export const CUSTOMER_NOT_FOUND = 'customer_not_found';
export const customerNotFoundException = createException(
  CUSTOMER_NOT_FOUND,
  STATUS_CODES.NOT_FOUND
);

export const PAYMENT_ALREADY_PROCESSED = 'payment_already_processed';
export const paymentAlreadyProcessedException = createException(
  PAYMENT_ALREADY_PROCESSED,
  STATUS_CODES.CONFLICT
);

export const PAYMENT_NOT_FOUND = 'payment_not_found';
export const paymentNotFoundException = createException(
  PAYMENT_NOT_FOUND,
  STATUS_CODES.NOT_FOUND
);
