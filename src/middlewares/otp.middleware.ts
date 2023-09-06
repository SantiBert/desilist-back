import {Request, Response, NextFunction} from 'express';
import {fromBase64} from '@/utils/base_x';

export const otpAndEmailFromBase64 = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const {email, code} = JSON.parse(fromBase64(req.body.hash));
    delete req.body.hash;
    req.body.email = email;
    req.body.otp = code;
    next();
  } catch (error) {
    next(error);
  }
};

export const emailFromBase64 = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const {email} = JSON.parse(fromBase64(req.body.hash));
    delete req.body.hash;
    req.body.email = email;
    next();
  } catch (error) {
    next(error);
  }
};
