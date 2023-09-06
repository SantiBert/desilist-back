export enum PAYMENT_METHOD_TYPE {
  ACSS_DEBIT = 'acss_debit',
  CARD = 'card',
  CUSTOMER_BALANCE = 'customer_balance'
}

export enum PAYMENT_CANCEL_REASON {
  DUPLICATE = 'duplicate',
  FRAUDULENT = 'fraudulent',
  REQUESTED_BY_CUSTOMER = 'requested_by_customer',
  ABANDONED = 'abandoned'
}

export enum PAYMENT_FUTURE_USAGE {
  ON_SESSION = 'on_session',
  OFF_SESSION = 'off_session',
  NONE = 'none'
}

export enum PAYMENT_CREATION_RECOVERY_POINT {
  STARTED = 'started',
  CREATED_CUSTOMER = 'created_customer',
  CREATED_PAYMENY = 'payment_created',
  FINISHED = 'finished'
}

export enum PAYMENT_STATUS {
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  FINISHED = 'FINISHED'
}

export enum PAYMENT_CURRENCY {
  USD = 'usd'
}

export enum PAYMENT_TYPE {
  EXTEND = 'extend'
}
