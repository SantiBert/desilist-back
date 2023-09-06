/**
 * @description pm2 configuration file.
 */

// import {config} from 'dotenv';
// config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});

// fix: dev script (we should call ts-node, not dist-server. In windows we must call ./node_modules/ts-node)
module.exports = {
  apps: [
    {
      name: 'dev', // pm2 start App name
      // script: 'ts-node', // ts- node
      script: '/dist/server.js',
      args: '-r tsconfig-paths/register --transpile-only src/server.ts', // ts-node args
      exec_mode: 'cluster', // 'cluster' or 'fork'
      instance_var: 'INSTANCE_ID', // instance variable
      instances: 2, // pm2 instance count
      autorestart: true, // auto restart if process crash
      watch: false, // files change automatic restart
      ignore_watch: ['node_modules', 'logs'], // ignore files change
      max_memory_restart: '1G', // restart if process use more than 1G memory
      merge_logs: true, // if true, stdout and stderr will be merged and sent to pm2 log
      output: './logs/development/access.log', // pm2 log file
      error: './logs/development/error.log', // pm2 error log file
      env: {
        // environment variable
        NODE_ENV: 'dev'
         /*
        bASE_PATH: '/',
        DATABASE_URL: 'postgresql://',
        JWT_SECRET: 'secret',
        SESSION_EXPIRY: 600,
        REFRESH_TOKEN_SECRET: 'secret',
        REFRESH_TOKEN_EXPIRY: 3600,
        LOG_FORMAT: 'test',
        LOG_DIR: '../logs',
        ORIGIN: '*',
        CREDENTIALS: true,
        POSTGRES_VERSION: '12.0-alpine',
        POSTGRES_DB: 'desilist_test',
        POSTGRES_USER: 'postgres_user',
        POSTGRES_PASSWORD: 'postgres_password',
        POSTGRES_PORT: 5432,
        POSTGRES_HOST: 'localhost',
        POSTGRES_VOLUMEN_PATH: './data/pgsql',
        SENDGRID_API_KEY: 'SG.test',
        MAILER_DEFAULT_SENDER: 'test@test.com',
        TWILIO_SID: 'sid',
        TWILIO_TOKEN: 'token',
        TELEPHONY_DEFAULT_SENDER: '+11111111111',
        LOCALE_TIMEZONE: 'America/Buenos_Aires',
        OTP_LEN: 7,
        OTP_EXPIRY: 1800,
        API_MINIMAL_SUPPORTED_VERSION: '1.0.0',
        FE_URL: 'http://localhost:3000',
        FE_ACTIVATE_ACCOUNT_ENDPOINT: 'confirm',
        FE_CHANGE_PASSWORD_ENDPOINT: 'changePassword',
        CONTACT_US_EMAIL: 'example@mail.com',
        CONTACT_US_SUBJECT: 'Contact from Desilist',
        RE_VERSION: 3,
        RE_PUBLIC_KEY: 'PublicKey',
        RE_PRIVATE_KEY: 'PrivateKey',
        RE_VALID_SCORE: 0.5,
        S3_BUCKET: 'bucket_name',
        S3_ACCESS_KEY_ID: 'access_key_id',
        S3_SECRET_ACCESS_KEY: 'secret_access_key' */
      }
    }
  ]
};
