import {Response, NextFunction} from 'express';
import {RequestWithVersion} from '@/interfaces/auth.interface';
import {Headers} from '@/constants/headers';
import {checkVersionFormat} from '@/guards/apiVersion.guard';

export const checkAPIVersion = (
  req: RequestWithVersion,
  res: Response,
  next: NextFunction
): void => {
  try {
    // fix: hardcoded api version to automatic inferred version
    const version: string = req.header(Headers.API_VERSION) || '1.0.0';
    checkVersionFormat(version);
    req.version = version;
    next();
  } catch (error) {
    next(error);
  }
};
