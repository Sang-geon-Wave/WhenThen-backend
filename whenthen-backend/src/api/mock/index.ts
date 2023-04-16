import express, { Request, Response, Router } from 'express';
import promisePool from '../../db';
import { authProtected, authUnprotected } from '../../middlewares/auth';

const router: Router = express.Router();

router.get('/', authUnprotected, (req: Request, res: Response) => {
  return res.status(200).json({
    status: 200,
    message: 'Mock message',
  });
});

router.get('/auth', authProtected, async (req: Request, res: Response) => {
  const [rows, fields] = await promisePool.execute('SELECT * from USER');

  console.log(rows, fields);

  return res.status(200).json({
    status: 200,
    message: 'Mock message',
    users: rows,
  });
});

module.exports = router;
