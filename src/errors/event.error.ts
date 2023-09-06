import {STATUS_CODES} from '@/constants/statusCodes';
import {createException} from '@/exceptions/HttpException';

export const EVENT_NOT_FOUND = 'event_not_found';
export const eventNotFoundException = createException(
  EVENT_NOT_FOUND,
  STATUS_CODES.CONFLICT
);

export const EVENT_UNAUTHORIZED = 'insufficient_permissions';
export const eventUnathorizedException = createException(
  EVENT_UNAUTHORIZED,
  STATUS_CODES.FORBIDDEN
);

export const EVENT_TOO_MANY_IMAGES = 'too_many_images';
export const eventTooManyImagesException = createException(
  EVENT_TOO_MANY_IMAGES,
  STATUS_CODES.REQUEST_TOO_LONG
);

export const EVENT_CANT_PUBLISH = 'cant_publish';
export const eventCantPublishException = createException(
  EVENT_CANT_PUBLISH,
  STATUS_CODES.CONFLICT
);

export const EVENT_CANT_EDIT = 'cant_edit';
export const eventCantEditException = createException(
  EVENT_CANT_EDIT,
  STATUS_CODES.CONFLICT
);

export const EVENT_WITHOUT_ACTIVE_PACKAGE = 'no_active_package';
export const eventWithoutActivePackageException = createException(
  EVENT_WITHOUT_ACTIVE_PACKAGE,
  STATUS_CODES.CONFLICT
);

export const INVALID_REASONS = 'invalid_flag_reasons';
export const invalidFlagReasonsException = createException(
  INVALID_REASONS,
  STATUS_CODES.CONFLICT
);

export const FLAG_ALREADY_REPORTED = 'event_already_reported';
export const eventAlreadyReportedException = createException(
  FLAG_ALREADY_REPORTED,
  STATUS_CODES.CONFLICT
);

export const HIGHLIGHT_WITHOUT_PROMOTE = 'highlight_without_promote';
export const highlightWithoutPromoteException = createException(
  HIGHLIGHT_WITHOUT_PROMOTE,
  STATUS_CODES.CONFLICT
);

export const EVENT_STILL_IN_REVIEW = 'event_still_in_review';
export const eventStillInReviewException = createException(
  EVENT_STILL_IN_REVIEW,
  STATUS_CODES.CONFLICT
);

export const TICKET_DUPLICATE_NAME = 'ticket_duplicate_name';
export const ticketDuplicateNameException = createException(
  TICKET_DUPLICATE_NAME,
  STATUS_CODES.CONFLICT
);

export const INVALID_EVENT_STATUS = 'invalid_event_status';
export const invalidEventStatusException = createException(
  INVALID_EVENT_STATUS,
  STATUS_CODES.CONFLICT
);

export const TICKET_ALREADY_BUYED = 'ticket_already_buyed';
export const ticketAlreadyBuyedException = createException(
  TICKET_ALREADY_BUYED,
  STATUS_CODES.CONFLICT
);