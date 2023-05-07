import express, { Request, Response, Router } from 'express';
import {
  authProtected,
  authUnprotected,
  IGetUserAuthInfoRequest,
} from '../../middlewares/auth';
import HttpStatus from 'http-status-codes';
import promisePool from '../../db';

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
      const query_per_page = 10;
      let page: number = 1;
      if (req.query.page) page = parseInt(req.query.page as string);
      if (page <= 0) throw new Error('page cannot be negative or zero!');
      if (
        req.query.type == 'detail' ||
        req.query.type == 'title' ||
        req.query.type == 'start_datetime' ||
        req.query.type == 'end_datetime' ||
        req.query.type == 'place'
      ) {
        if (!req.query.value)
          throw new Error(
            `${req.query.type} does exist, but value doesn't exist.`,
          );
        const [rows, _] = await promisePool.execute(
          `SELECT * FROM ARTICLE WHERE ${req.query.type} LIKE '%${
            req.query.value
          }%' LIMIT ${query_per_page} OFFSET ${(page - 1) * query_per_page}`,
        );

        const data: ISearchData[] = [];
        if (rows.length) {
          rows.forEach((row: any) => {
            const searchData: ISearchData = {
              title: row.title,
              thumbnail: row.thumbnail,
              detail: row.detail,
              url: row.url,
              place: row.place,
              start_datetime: row.start_datetime,
              end_datetime: row.end_datetime,
              user_id: row.user_id,
            };
            data.push(searchData);
          });
        }

        return res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          page: page,
          data: data,
        });
      }
      throw new Error('Search type is invalid.');
    } catch (err: any) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  },
);

module.exports = router;
