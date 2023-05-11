import express, { Request, Response, Router } from 'express';
import promisePool from '../../db';
import {
  authProtected,
  authUnprotected,
  IGetUserAuthInfoRequest,
} from '../../middlewares/auth';
import HttpStatus from 'http-status-codes';

const router: Router = express.Router();

router.get(
  '/like',
  authProtected,
  async (req: IGetUserAuthInfoRequest, res: Response) => {
    const [rows, fields] = await promisePool.execute(`
      SELECT title, thumbnail, detail, url, place, start_datetime, end_datetime, ROW_NUMBER ( ) OVER (ORDER BY DATE(start_datetime)) AS ROW_NUM
      FROM SUBSCRIBE 
        INNER JOIN ARTICLE ON SUBSCRIBE.article_id = ARTICLE.id 
        INNER JOIN USER ON SUBSCRIBE.user_id = USER.id 
      WHERE USER.user_id IN ('${req.user?.userId}');
      `);

    const articleInfo: any[] = [];

    rows.forEach((row: any) => {
      const articleObj = {
        title: row.title,
        thumbnail: row.thumbnail,
        detail: row.detail,
        url: row.url,
        place: row.place,
        start_date: row.start_datetime,
        end_date: row.end_datetime,
      };
      articleInfo.push(articleObj);
    });

    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'user like article info',
      users: articleInfo,
    });
  },
);

router.get('/all', authUnprotected, async (req: Request, res: Response) => {
  const [rows, fields] = await promisePool.execute(`
    SELECT title, thumbnail, detail, url, place, start_datetime, end_datetime, ROW_NUMBER ( ) OVER (ORDER BY DATE(start_datetime)) AS ROW_NUM
    FROM ARTICLE;
    `);

  const articleInfo: any[] = [];

  rows.forEach((row: any) => {
    const articleObj = {
      title: row.title,
      thumbnail: row.thumbnail,
      detail: row.detail,
      url: row.url,
      place: row.place,
      start_date: row.start_datetime,
      end_date: row.end_datetime,
    };
    articleInfo.push(articleObj);
  });

  return res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'article info',
    users: articleInfo,
  });
});

module.exports = router;
