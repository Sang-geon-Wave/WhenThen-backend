import { Request, Response, NextFunction } from 'express';
import config from '../config';
import jwt from 'jsonwebtoken';

const authChecker = (req: Request, res: Response, next: NextFunction) => {
  // Todo: req.authenticated user info update
  try {
    const accessToken = req.headers.authorization!;

    const user = jwt.verify(accessToken, config.jwt_secret);
    console.log('Access Token verified', user);
    // req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 401,
      message: 'access token expired',
    });
  }
};

export const authProtected = [authChecker];
export const authUnprotected: ((
  req: Request,
  res: Response,
  next: NextFunction,
) => void)[] = [];

export default {
  authProtected,
  authUnprotected,
};
