import express, { Request, Response, Router } from 'express';
import config from '../../config';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const router: Router = express.Router();

router.get('/login', (req: Request, res: Response) => {
  const access_token = jwt.sign(
    {
      user_id: 'test',
    },
    config.jwt_secret,
    { expiresIn: '1h' },
  );

  const refresh_token = uuidv4();
  // Todo: store refresh_token in DB

  res.cookie('refresh_token', refresh_token, { httpOnly: true });

  return res.status(200).json({
    status: 200,
    message: 'login success',
    access_token: access_token,
  });
});

router.get('/refresh', (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    // Todo: check refresh token on DB

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
  } catch (err) {}
});

router.get('/logout', (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.cookies;
    // Todo: remove refresh_token on DB
    res.clearCookie('refresh_token');
  } catch (err) {}

  return res.status(200).json({
    status: 200,
    message: 'logout success',
  });
});

module.exports = router;
