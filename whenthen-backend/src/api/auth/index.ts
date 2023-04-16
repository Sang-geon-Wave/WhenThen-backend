import express, { Request, Response, Router } from 'express';
import promisePool from '../../db';
import config from '../../config';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const router: Router = express.Router();

router.get('/login', async (req: Request, res: Response) => {
  const access_token = jwt.sign(
    {
      user_id: 'test',
    },
    config.jwt_secret,
    { expiresIn: '1h' },
  );

  const refresh_token = uuidv4();
  // Todo: store refresh_token in DB
  const result = await promisePool.execute(
    `UPDATE USER SET access_token='${refresh_token}' WHERE user_id='usr';`,
  );
  console.log(result);

  res.cookie('refresh_token', refresh_token, { httpOnly: true });

  return res.status(200).json({
    status: 200,
    message: 'login success',
    access_token: access_token,
  });
});

router.get('/refresh', async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    console.log(req.cookies);

    // Todo: check refresh token on DB
    const [rows, fields] = await promisePool.execute(
      `SELECT * from USER WHERE access_token='${refresh_token}'`,
    );
    console.log('/auth/refresh rows', rows);

    if (rows.length) {
      const access_token = jwt.sign(
        {
          user_id: 'test',
        },
        config.jwt_secret,
        { expiresIn: '1h' },
      );

      return res.status(200).json({
        status: 200,
        message: 'refresh success',
        access_token: access_token,
      });
    }
  } catch (err) {
    console.log(err);
  }

  return res.status(401).json({
    status: 401,
    message: 'invalid refresh token',
  });
});

router.get('/logout', async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    // Todo: remove refresh_token on DB
    const result = await promisePool.execute(
      `UPDATE USER SET access_token=NULL WHERE user_id='${refresh_token}';`,
    );
    res.clearCookie('refresh_token');
  } catch (err) {}

  return res.status(200).json({
    status: 200,
    message: 'logout success',
  });
});

module.exports = router;
