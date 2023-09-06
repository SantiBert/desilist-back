import { createException } from "@/exceptions/HttpException";
import { STATUS_CODES } from '@/constants/statusCodes';

export const TICKET_UNAUTHORIZED = 'insufficient_permissions';
export const ticketUnathorizedException = createException(
  TICKET_UNAUTHORIZED,
  STATUS_CODES.FORBIDDEN
);

export const TICKET_NOT_FOUND = 'ticket_not_found';
export const ticketNotFoundException = createException(
  TICKET_NOT_FOUND,
  STATUS_CODES.CONFLICT
);

export const TICKET_NOT_BELONG = 'ticket_not_belong';
export const ticketNotBelongException = createException(
  TICKET_NOT_BELONG,
  STATUS_CODES.CONFLICT
);

