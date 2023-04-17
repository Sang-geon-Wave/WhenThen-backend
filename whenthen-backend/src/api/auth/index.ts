import express, { Request, Response, Router } from 'express';
import promisePool from '../../db';
import crypto from 'crypto';
import { genAccessToken, genRefreshToken } from '../../middlewares/auth';

const router: Router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { user_id: userId, user_pw: userPw, autologin } = req.body;

    const userPwHashed = crypto
      .createHash('sha256') // Todo: apply hash secret: .createHmac('sha256', hashSecret)
      .update(userPw)
      .digest('hex');

    const [rows, _] = await promisePool.execute(
      `SELECT * from USER WHERE user_id='${userId}' and password_sha256='${userPwHashed}'`,
    );

    if (rows.length) {
      // Generate access token
      const { email, nickname } = rows[0];
      const accessToken = genAccessToken({
        user_id: userId,
        email: email,
        nickname: nickname,
      });

      // Generate refresh token & store it in DB and cookie
      const refreshToken = genRefreshToken();
      await promisePool.execute(
        `UPDATE USER SET refresh_token='${refreshToken}' WHERE user_id='usr';`,
      );
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        ...(autologin
          ? {
              maxAge: 2592000000, // remember for 30 days
            }
          : {}),
      });

      return res.status(200).json({
        status: 200,
        message: 'login success',
        access_token: accessToken,
      });
    }
  } catch (err) {}

  return res.status(401).json({
    status: 401,
    message: 'login fail',
  });
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refresh_token: refreshToken } = req.cookies;

    // Check refresh token on DB
    const [rows, _] = await promisePool.execute(
      `SELECT * from USER WHERE refresh_token='${refreshToken}'`,
    );

    if (rows.length) {
      const { user_id: userId, email, nickname } = rows[0];
      const accessToken = genAccessToken({
        user_id: userId,
        email: email,
        nickname: nickname,
      });

      return res.status(200).json({
        status: 200,
        message: 'refresh success',
        access_token: accessToken,
      });
    }
  } catch (err) {}

  return res.status(401).json({
    status: 401,
    message: 'invalid refresh token',
  });
});

router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refresh_token: refreshToken } = req.cookies;
    // Remove refresh_token on DB
    await promisePool.execute(
      `UPDATE USER SET refresh_token=NULL WHERE refresh_token='${refreshToken}';`,
    );
    res.clearCookie('refresh_token');
  } catch (err) {}

  return res.status(200).json({
    status: 200,
    message: 'logout success',
  });
});

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { user_id: userId, user_pw: userPw } = req.body;

    const userPwHashed = crypto
      .createHash('sha256') // Todo: apply hash secret: .createHmac('sha256', hashSecret)
      .update(userPw)
      .digest('hex');

    const [rows, _] = await promisePool.execute(
      `SELECT * from USER WHERE user_id='${userId}'`,
    );

    if (rows.length) {
      return res.status(409).json({
        status: 409,
        message: 'Account already exists',
      });
    }

    await promisePool.execute(
      `INSERT INTO USER (id, user_id, email, password_sha256) VALUES (MID(UUID(),1,36), '${userId}', '', '${userPwHashed}');`,
    );

    return res.status(200).json({
      status: 200,
      message: 'signup success',
    });
  } catch (err) {}

  return res.status(500).json({
    status: 500,
    message: 'signup fail',
  });
});

module.exports = router;
