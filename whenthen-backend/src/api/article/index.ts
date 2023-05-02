import express, { Request, Response, Router } from 'express';
import promisePool from '../../db';
import { authProtected, authUnprotected } from '../../middlewares/auth';
import HttpStatus from 'http-status-codes';

const router: Router = express.Router();

router.get('/like', authProtected, async (req: Request, res: Response) => {
  const [rows, fields] = await promisePool.execute('SELECT * from ARTICLE');

  const articleInfo: any[] = [];

  if (rows.length) {
    for (let i = 0; i < rows.length; i++) {
      const {
        title,
        thumbnail,
        detail,
        url,
        place,
        start_datetime,
        end_datetime,
      } = rows[i];
      const articleObj = {
        title: title,
        thumbnail: thumbnail,
        detail: detail,
        url: url,
        place: place,
        start_datetime: start_datetime,
        end_datetime: end_datetime,
      };
      articleInfo.push(articleObj);
    }
  }

  return res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'user like article info',
    users: articleInfo,
  });
});

router.get('/all', authUnprotected, async (req: Request, res: Response) => {
  const [rows, fields] = await promisePool.execute('SELECT * from ARTICLE');

  const articleInfo: any[] = [];

  if (rows.length) {
    for (let i = 0; i < rows.length; i++) {
      const {
        title,
        thumbnail,
        detail,
        url,
        place,
        start_datetime,
        end_datetime,
      } = rows[i];
      const articleObj = {
        title: title,
        thumbnail: thumbnail,
        detail: detail,
        url: url,
        place: place,
        start_datetime: start_datetime,
        end_datetime: end_datetime,
      };
      articleInfo.push(articleObj);
    }
  }

  return res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'article info',
    users: articleInfo,
  });
});

module.exports = router;
