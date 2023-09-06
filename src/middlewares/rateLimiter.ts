/* eslint-disable prettier/prettier */
import {Request, Response, NextFunction} from 'express';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/naming-convention
const {RateLimiterMemory} = require('rate-limiter-flexible');
import config from '@/config';
import {tooManyRequestsErrorException} from '@/errors/generics.erros';

const POINTS = config.app.rate_limiter.points;
const DURATION = config.app.rate_limiter.duration;

const rateLimiter = new RateLimiterMemory({
  points: POINTS,
  duration: DURATION
});

const getIp = (req: Request): string | string[] =>
  (config.environment === 'production' && config.app.rate_limiter.x_forwarded_for
    ? req.headers['x-forwarded-for'] || req.socket.remoteAddress
    : req.socket.remoteAddress);

export const rateLimiterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const ip = getIp(req);
  console.log(ip);
  rateLimiter
    .consume(ip, 2) // consume 2 points
    .then((rateLimiterRes: any) => {
      rateLimiterRes;
      next();
    })
    .catch(() => {
      next(tooManyRequestsErrorException('Too many requests'));
    });
};
