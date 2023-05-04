import express, { Request, Response, Router } from 'express';
import {
  authProtected,
  authUnprotected,
  IGetUserAuthInfoRequest,
} from '../../middlewares/auth';
import HttpStatus from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import mysql from 'mysql2';
import promisePool from '../../db';

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/create',
  authProtected,
  upload.single('thumbnail'),
  async (req: IGetUserAuthInfoRequest, res: Response) => {
    try {
      let image: Buffer | undefined;
      if (req.file) {
        image = req.file.buffer;
        console.log(image);
      }

      await promisePool.execute(
        `INSERT INTO ARTICLE (id, title, thumbnail, detail, url, place, start_datetime, end_datetime, user_id) VALUES ('${uuidv4()}', '${
          req.body.title
        }',${image ? `${mysql.escape(image)}` : 'NULL'},'${
          req.body.contents
        }','${req.body.eventUrl}','${req.body.placeAddr}','${
          req.body.startDate
        }','${req.body.endDate}','${req.user?.userId}');`,
      );

      return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'article post success',
      });
    } catch (err) {}

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'article post fail',
    });
  },
);

module.exports = router;
