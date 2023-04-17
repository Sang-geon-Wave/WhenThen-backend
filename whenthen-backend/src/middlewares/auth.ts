import { Request, Response, NextFunction } from 'express';
import config from '../config';
import jwt from 'jsonwebtoken';

export interface IGetUserAuthInfoRequest extends Request {
  user?: {
    userId: string;
    email: string | null;
    nickname: string | null;
  };
}
interface JwtPayload {
  user_id: string;
  email: string | null;
  nickname: string | null;
}

const authChecker = (
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction,
) => {
  // Todo: req.authenticated user info update
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
