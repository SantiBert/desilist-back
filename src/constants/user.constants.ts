export const enum UserRoles {
  ADMIN = 1,
  USER,
  GUEST
}

export const enum UserStatus {
  ACTIVE = 1,
  INACTIVE,
  PENDING_VERIFICATION,
  DISABLED,
  BLOCKED
}

export const enum UserSources {
  PHONE = 'PHONE',
  WEB = 'WEB'
}

export enum UserFlow {
  EMAIL = 'EMAIL',
  SMS = 'SMS'
}

export enum UserTemplates {
  ACTIVATE_ACCOUNT = 'ACTIVATE_ACCOUNT',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD'
}

export const USER_ID_FORMAT_REGEX =
  '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
