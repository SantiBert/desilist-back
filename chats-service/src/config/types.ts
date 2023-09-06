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
  rate_limiter: RateLimiterConfig;
};

type UrlConfig = {
  url: string;
};

type TokenConfig = {
  jwt_secret: string;
  session_expiry: number;
  refresh_token_secret: string;
  refresh_token_expiry: number;
};

export type Config = {
  environment: string;
  app: AppConfig;
  frontend: UrlConfig;
  backend: UrlConfig;
  token: TokenConfig;
};
