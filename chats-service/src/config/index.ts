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
    app: {
      api_minimal_supported_version: getEnvVar('API_MINIMAL_SUPPORTED_VERSION'),
      cors_credentials: getEnvVar('CREDENTIALS') === 'true',
      cors_origin: getEnvVar('ORIGIN'),
      log_dir: getEnvVar('LOG_DIR'),
      log_format: getEnvVar('LOG_FORMAT'),
      base_path: getEnvVar('BASE_PATH', '/'),
      port: Number(getEnvVar('PORT', '3000')),
      request_size: Number(getEnvVar('REQUEST_SIZE', '100')),
      rate_limiter: {
        x_forwarded_for: getEnvVar('RL_X_FORWARDED_FOR', 'true') === 'true',
        points: Number(getEnvVar('RL_POINTS', '6')),
        duration: Number(getEnvVar('RL_DURATION', '1'))
      }
    },
    frontend: {
      url: getEnvVar('FE_URL')
    },
    backend: {
      url: getEnvVar('BK_URL')
    },
    token: {
      jwt_secret: getEnvVar('JWT_SECRET'),
      session_expiry: Number(getEnvVar('SESSION_EXPIRY')),
      refresh_token_secret: getEnvVar('REFRESH_TOKEN_SECRET'),
      refresh_token_expiry: Number(getEnvVar('REFRESH_TOKEN_EXPIRY'))
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
