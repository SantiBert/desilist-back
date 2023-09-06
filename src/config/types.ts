type DBConnection = {
  port: number;
  host: string;
  user: string;
  password: string;
  database: string;
  ssl: string;
};

type DBPoolConfig = {
  min: number;
  max: number;
};

type Database = {
  connection: DBConnection;
  pool: DBPoolConfig;
  connectionTimeout: number;
};

type RateLimiterConfig = {
  x_forwarded_for: boolean;
  points: number;
  duration: number;
};

type AppConfig = {
  api_minimal_supported_version: string;
  cors_credentials: boolean;
  cors_origin: string;
  log_dir: string;
  log_format: string;
  base_path: string;
  port: number;
  request_size: number;
  upload_size: number;
  big_upload_size: number;
  rate_limiter: RateLimiterConfig;
};

type FrontendConfig = {
  endpoints: FrontendEndpointConfig;
  url: string;
};

type FrontendEndpointConfig = {
  activate_account: string;
  change_password: string;
  restore_account: string;
  chat: string;
  unsuscribe: string;
  dashboard: string;
  admin_flagged: string;
  flagged: string;
  redeem_qr: string;
  my_tickets: string;
};

type MailerConfig = {
  sendgrid: SengridConfig;
  default_sender: string;
  default_sender_name: string;
  default_reply_to: string;
  enabled: boolean;
};

type SengridConfig = {
  api_key: string;
  activate_account: string;
  check_your_dashboard:string;
  contact_us: string;
  new_chat_mesage: string;
  restore_account: string;
  restore_password: string;
  listing_expire: string;
  listing_reported: string;
  listing_flagged: string;
  listing_updated: string;
  listing_denied: string;
  listing_deleted: string;
  listing_flagged_approved: string;
  account_deleted: string;
  buy_event_ticket: string;
  event_approved: string;
  event_need_changes: string;
  event_updated: string;
  new_event_pending: string;
  event_denied: string;
  event_paused: string;
  event_expired: string;
  event_flagged_approved: string;
  event_reported:string;
  event_has_been_flaged:string;
  event_update_flaged_denied:string;
};

type TelephonyConfig = {
  twilio: TwilioConfig;
  default_sender: string;
};

type TokenConfig = {
  jwt_secret: string;
  session_expiry: number;
  refresh_token_secret: string;
  refresh_token_expiry: number;
};

type OTPConfig = {
  length: number;
  expiry: number;
};

type TwilioConfig = {
  account_sid: string;
  token: string;
};

type ContactConfig = {
  to: string;
  subject: string;
};

type RecaptchaConfig = {
  version: number;
  public: string;
  private: string;
  score: number | null;
};

type AWSConfig = {
  s3: S3Config;
};

type S3Config = {
  bucket: string;
  access_key_id: string;
  secret_access_key: string;
};

type PaymentGateway = {
  stripe: StripeConfig;
};

type StripeConfig = {
  api_key: string;
};

type ChatService = {
  uri: string;
  port: number;
  enabled: boolean;
};

type NotificationService = {
  uri: string;
  port: number;
  enabled: boolean;
};

type ZipcodesService = {
  uri: string;
  port: number;
  enabled: boolean;
};

type ListingsPackages = {
  freeCategoryPackage: number;
};

type EventTickets = {
  buyTime: number;
  ticketPartiallySold:number;
}

type Attendance = {
  maximumDistance: number;
  timeDefece:Number;
}

type Event = {
  publishWithoutApproval: boolean;
}

export type Config = {
  environment: string;
  database: Database;
  app: AppConfig;
  frontend: FrontendConfig;
  mailer: MailerConfig;
  telephony: TelephonyConfig;
  token: TokenConfig;
  otp: OTPConfig;
  contact: ContactConfig;
  recaptcha: RecaptchaConfig;
  aws: AWSConfig;
  payment_gateway: PaymentGateway;
  chat_service: ChatService;
  notification_service: NotificationService;
  zipcodes_service: ZipcodesService;
  listings_packages: ListingsPackages;
  event_tickets: EventTickets;
  attendance:Attendance;
  event: Event;
};
