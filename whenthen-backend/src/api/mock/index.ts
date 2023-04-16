import express, { Request, Response, Router } from 'express';
import { authProtected, authUnprotected } from '../../middlewares/auth';

const router: Router = express.Router();

router.get('/', authUnprotected, (req: Request, res: Response) => {
  return res.status(200).json({
    status: 200,
    message: 'Mock message',
  });
});

router.get('/auth', authProtected, (req: Request, res: Response) => {
  return res.status(200).json({
    status: 200,
    message: 'Mock message',
  });
});

module.exports = router;
