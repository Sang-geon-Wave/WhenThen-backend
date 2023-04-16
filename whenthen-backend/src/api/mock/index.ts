import express, { Request, Response, Router } from 'express';
import promisePool from '../../db';

const router: Router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const [rows, fields] = await promisePool.execute('SELECT * from USER');

  console.log(rows, fields);

  return res.status(200).json({
    status: 200,
    message: 'Mock message',
    users: rows,
  });
});

module.exports = router;
