import express, { Request, Response, Router } from 'express';
import {
  authProtected,
  authUnprotected,
  IGetUserAuthInfoRequest,
} from '../../middlewares/auth';
import HttpStatus from 'http-status-codes';
import promisePool from '../../db';
import mysql from 'mysql2';

const router: Router = express.Router();

export interface ISearchData {
  title?: string;
  thumbnail?: Blob;
  detail?: string;
  url?: string;
  place?: string;
  start_datetime?: Date;
  end_datetime?: Date;
  user_id: string;
}

router.get(
  '/',
  authProtected,
  async (req: IGetUserAuthInfoRequest, res: Response) => {
    try {
      const resultsPerPage = 10;
      let page: number = parseInt(req.query.page as string) || 1;
      if (page <= 0) throw new Error('page cannot be negative or zero!');

      const validTypes = [
        'detail',
        'title',
        'url',
        'start_datetime',
        'end_datetime',
        'place',
      ];

      if (!validTypes.includes(req.query.type as string)) {
        throw new Error('Search type is invalid.');
      }

      if (!req.query.value)
        throw new Error(
          `${req.query.type} does exist, but value doesn't exist.`,
        );

      const offset = (page - 1) * resultsPerPage;
      const query = `SELECT * FROM ARTICLE WHERE ${mysql.escape(
        req.query.type,
      )} LIKE '%${mysql.escape(req.query.value)}%' LIMIT ${mysql.escape(
        resultsPerPage,
      )} OFFSET ${mysql.escape(offset)}`;
      const [rows, _] = await promisePool.execute(query);

      const data: ISearchData[] = rows.map((row: any) => ({
        title: row.title,
        thumbnail: row.thumbnail,
        detail: row.detail,
        url: row.url,
        place: row.place,
        start_datetime: row.start_datetime,
        end_datetime: row.end_datetime,
        user_id: row.user_id,
      }));

      return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        page: page,
        data: data,
      });
    } catch (err: any) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  },
);

module.exports = router;
