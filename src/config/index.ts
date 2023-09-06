import {config} from 'dotenv';
import {Config} from './types';
import {ENVIRONMENTS} from '@/constants';
config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});

const generateConfig = (): Config => {
  const missingKeys: string[] = [];
  const getEnvVar = (key: string, defaultValue?: string): string => {
    if (!process.env[key] && defaultValue === undefined) {
      missingKeys.push(key);
    }
    return (process.env[key] || defaultValue) as string;
  };
  const environment = process.env.NODE_ENV || ENVIRONMENTS.LOCAL;

  const config: Config = {
    environment,
    database: {
      connection: {
        port: Number(getEnvVar('POSTGRES_PORT', '5432')),
        host: getEnvVar('POSTGRES_HOST'),
        user: getEnvVar('POSTGRES_USER'),
        password: getEnvVar('POSTGRES_PASSWORD'),
        database: getEnvVar('POSTGRES_DB'),
        ssl:
          environment === ENVIRONMENTS.LOCAL ||
          environment === ENVIRONMENTS.TEST
            ? 'false'
            : 'false' // ssl config
      },
      pool: {
        min: Number(getEnvVar('DB_MIN_POOL', '0')),
        max: Number(getEnvVar('DB_MAX_POOL', '10'))
      },
      connectionTimeout: Number(getEnvVar('DB_CONNECTION_TIMEOUT', '10000'))
    },
    app: {
      api_minimal_supported_version: getEnvVar('API_MINIMAL_SUPPORTED_VERSION'),
      cors_credentials: getEnvVar('CREDENTIALS') === 'true',
      cors_origin: getEnvVar('ORIGIN'),
      log_dir: getEnvVar('LOG_DIR'),
      log_format: getEnvVar('LOG_FORMAT'),
      base_path: getEnvVar('BASE_PATH', '/'),
      port: Number(getEnvVar('PORT', '3000')),
      request_size: Number(getEnvVar('REQUEST_SIZE', '100')),
      upload_size: Number(getEnvVar('UPLOAD_SIZE', '200')),
      big_upload_size: Number(getEnvVar('BIG_UPLOAD_SIZE', '200')),
      rate_limiter: {
        x_forwarded_for: getEnvVar('RL_X_FORWARDED_FOR', 'true') === 'true',
        points: Number(getEnvVar('RL_POINTS', '6')),
        duration: Number(getEnvVar('RL_DURATION', '1'))
      }
    },
    frontend: {
      endpoints: {
        activate_account: getEnvVar('FE_ACTIVATE_ACCOUNT_ENDPOINT'),
        change_password: getEnvVar('FE_CHANGE_PASSWORD_ENDPOINT'),
        restore_account: getEnvVar('FE_RESTORE_ACCOUNT_ENDPOINT'),
        chat: getEnvVar('FE_CHAT_ENDPOINT'),
        unsuscribe: getEnvVar('FE_UNSUSCRIBE_ENDPOINT'),
        dashboard: getEnvVar('FE_DASHBOARD_ENDPOINT'),
        admin_flagged: getEnvVar('FE_ADMIN_FLAGGED_ENDPOINT'),
        flagged: getEnvVar('FE_FLAGGED_ENDPOINT'),
        redeem_qr:getEnvVar('FE_REDEEM_QRCODE'),
        my_tickets: getEnvVar('FE_MY_TICKETS')
      },
      url: getEnvVar('FE_URL')
    },
    mailer: {
      sendgrid: {
        api_key: getEnvVar('SENDGRID_API_KEY'),
        activate_account: getEnvVar('ACTIVATE_ACCOUNT_TEMPLATE_ID'),
        check_your_dashboard:getEnvVar('CHECK_YOUR_DASHBOARD_TEMPLATE_ID'),
        contact_us: getEnvVar('CONTACT_US_TEMPLATE_ID'),
        new_chat_mesage: getEnvVar('NEW_CHAT_MESSAGE_TEMPLATE_ID'),
        restore_account: getEnvVar('RESTORE_ACCOUNT_TEMPLATE_ID'),
        restore_password: getEnvVar('RESTORE_PASSWORD_TEMPLATE_ID'),
        listing_expire: getEnvVar('LISTING_TO_EXPIRE_TEMPLATE_ID'),
        listing_reported: getEnvVar('ADMIN_LISTING_REPORTED_TEMPLATE_ID'),
        listing_flagged: getEnvVar('LISTING_FLAGGED_TEMPLATE_ID'),
        listing_updated: getEnvVar('ADMIN_LISTING_UPDATED_TEMPLATE_ID'),
        listing_denied: getEnvVar('LISTING_UPDATE_DENIED_TEMPLATE_ID'),
        listing_deleted: getEnvVar('LISTING_DELETED_TEMPLATE_ID'),
        listing_flagged_approved: getEnvVar(
          'LISTING_FLAGGED_APPROVED_TEMPLATE_ID'
        ),
        account_deleted: getEnvVar('ACCOUNT_DELETED_TEMPLATE_ID'),
        buy_event_ticket: getEnvVar('BUY_EVENT_TICKETS_TEMPLATE_ID'),
        event_approved: getEnvVar('EVENT_APPROVE'),
        event_need_changes: getEnvVar('EVENT_NEED_CHANGES'),
        event_updated: getEnvVar('EVENT_PENDING_UPDATED'),
        new_event_pending: getEnvVar('NEW_EVENT_PENDING_TEMPLATE_ID'),
        event_denied:getEnvVar('EVENT_DENIED_TEMPLATE_ID'),
        event_paused:getEnvVar('EVENT_PAUSED_TEMPLATE_ID'),
        event_expired:getEnvVar('EVENT_EXPIRED_TEMPLATE_ID'),
        event_flagged_approved: getEnvVar('EVENT_FLAGGED_APPROVED_TEMPLATE_ID'),
        event_reported:getEnvVar('EVENT_REPORTED_TEMPLATE_ID'),
        event_has_been_flaged:getEnvVar('EVENT_HAS_BEEN_FLAGED_TEMPLATE_ID'),
        event_update_flaged_denied:getEnvVar('EVENT_FLAG_UPDATE_DENIED_TEMPLATE_ID')
      },
      default_sender: getEnvVar('MAILER_DEFAULT_SENDER'),
      default_sender_name: getEnvVar('MAILER_DEFAULT_SENDER_NAME'),
      default_reply_to: getEnvVar('MAILER_DEFAULT_NO_REPLY'),
      enabled: getEnvVar('MAILER_ENABLED', 'true') === 'true'
    },
    telephony: {
      twilio: {
        account_sid: getEnvVar('TWILIO_SID'),
        token: getEnvVar('TWILIO_TOKEN')
      },
      default_sender: getEnvVar('TELEPHONY_DEFAULT_SENDER')
    },
    token: {
      jwt_secret: getEnvVar('JWT_SECRET'),
      session_expiry: Number(getEnvVar('SESSION_EXPIRY')),
      refresh_token_secret: getEnvVar('REFRESH_TOKEN_SECRET'),
      refresh_token_expiry: Number(getEnvVar('REFRESH_TOKEN_EXPIRY'))
    },
    otp: {
      length: Number(getEnvVar('OTP_LEN')),
      expiry: Number(getEnvVar('OTP_EXPIRY'))
    },
    contact: {
      to: getEnvVar('CONTACT_US_EMAIL'),
      subject: getEnvVar('CONTACT_US_SUBJECT')
    },
    recaptcha: {
      version: Number(getEnvVar('RE_VERSION')),
      public: getEnvVar('RE_PUBLIC_KEY'),
      private: getEnvVar('RE_PRIVATE_KEY'),
      score: Number(getEnvVar('RE_VALID_SCORE'))
    },
    aws: {
      s3: {
        bucket: getEnvVar('S3_BUCKET'),
        access_key_id: getEnvVar('S3_ACCESS_KEY_ID'),
        secret_access_key: getEnvVar('S3_SECRET_ACCESS_KEY')
      }
    },
    payment_gateway: {
      stripe: {
        api_key: getEnvVar('STRIPE_API_KEY')
      }
    },
    chat_service: {
      uri: getEnvVar('CT_URI'),
      port: Number(getEnvVar('CT_PORT', '8000')),
      enabled: getEnvVar('CHAT_SERVICE_ENABLED', 'true') === 'true'
    },
    notification_service: {
      uri: getEnvVar('NS_URI'),
      port: Number(getEnvVar('NS_PORT', '5000')),
      enabled: getEnvVar('NOTIFICATION_SERVICE_ENABLED', 'true') === 'true'
    },
    zipcodes_service: {
      uri: getEnvVar('ZC_URI'),
      port: Number(getEnvVar('NS_PORT', '7000')),
      enabled: getEnvVar('ZIPCODES_SERVICE_ENABLED', 'true') === 'true'
    },
    listings_packages: {
      freeCategoryPackage: Number(getEnvVar('FREE_CATEGORY_PACKAGE'))
    },
    event_tickets: {
      buyTime: Number(getEnvVar('TICKET_BUY_TIME')),
      ticketPartiallySold: Number(getEnvVar('TICKET_PARTIALLY_SOLD'))
    },
    attendance:{
      maximumDistance:Number(getEnvVar('GEO_FENCE')),
      timeDefece:Number(getEnvVar('TIME_DEFENSE'))
    },
    event: {
      publishWithoutApproval: getEnvVar('PUBLISH_WITHOUT_APPROVAL', 'false') === 'true'
    }

  };
  if (missingKeys.length) {
    throw new Error(
      `The following environment variables are missing: ${missingKeys}`
    );
  }
  return config;
};

export default generateConfig();
