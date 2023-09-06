import {STATUS_CODES} from '@/constants/statusCodes';
import {createException} from '@/exceptions/HttpException';


export const EVENT_NOT_FOUND = 'event_not_found';
export const eventNotFoundException = createException(
  EVENT_NOT_FOUND,
  STATUS_CODES.CONFLICT
);

export const TICKET_NOT_FOUND = 'ticket_not_found';
export const ticketNotFoundException = createException(
  TICKET_NOT_FOUND,
  STATUS_CODES.CONFLICT
);

export const EXCEED_BUY_DATE = 'exceed_buy_date';
export const exceedBuyDateException = createException(
  EXCEED_BUY_DATE,
  STATUS_CODES.CONFLICT
);

export const QUANTITY_NOT_AVAILABLE= 'quantity_not_avaible';
export const quantityNotAvailableException = createException(
  QUANTITY_NOT_AVAILABLE,
  STATUS_CODES.CONFLICT
);

export const MAX_ORDER_EXCEED= 'max_order_exceed';
export const maxOrderExceedException = createException(
  MAX_ORDER_EXCEED,
  STATUS_CODES.CONFLICT
);

export const NO_ACTIVE_TICKETS = 'no_active_tickets';
export const noActiveTicketsException = createException(
  NO_ACTIVE_TICKETS,
  STATUS_CODES.CONFLICT
);

export const TICKET_NOT_BELONG = 'ticket_not_belong';
export const ticketNotBelongException = createException(
  TICKET_NOT_BELONG,
  STATUS_CODES.CONFLICT
);

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

export const EVENT_INVALID_DATE = 'event_invalid_date';
export const eventInvalidDateException = createException(
  EVENT_INVALID_DATE,
  STATUS_CODES.CONFLICT
);

export const EVENT_INVALID_TICKET = 'event_invalid_ticket';
export const eventInvalidTicketException = createException(
  EVENT_INVALID_TICKET,
  STATUS_CODES.CONFLICT
);