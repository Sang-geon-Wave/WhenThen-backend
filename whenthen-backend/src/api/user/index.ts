import express, { Request, Response, Router } from 'express';
import promisePool from '../../db';
import {
  authProtected,
  authUnprotected,
  IGetUserAuthInfoRequest,
} from '../../middlewares/auth';

const router: Router = express.Router();

router.get(
  '/me',
  authProtected,
  (req: IGetUserAuthInfoRequest, res: Response) => {
    return res.status(200).json({
      status: 200,
      user_id: req.user?.userId,
      email: req.user?.email,
      nickname: req.user?.nickname,
    });
  },
);

module.exports = router;
