import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import config from '../config';

export interface IGetUserAuthInfoRequest extends Request {
  user?: {
    userId: string;
    email: string | null;
    nickname: string | null;
  };
}
export interface JwtPayload {
  user_id: string;
  email: string | null;
  nickname: string | null;
}

export const genAccessToken = (user: JwtPayload) => {
  return jwt.sign(user, config.jwt_secret, { expiresIn: '1m' });
};
export const genRefreshToken = () => {
  return uuidv4();
};

const authChecker = (
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.headers.authorization!;

    const user = jwt.verify(accessToken, config.jwt_secret);
    const { user_id: userId, email, nickname } = user as JwtPayload;
    req.user = {
      userId: userId,
      email: email,
      nickname: nickname,
    };

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
