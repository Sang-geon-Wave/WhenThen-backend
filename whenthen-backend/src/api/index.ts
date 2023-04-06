import express, { Router } from 'express';

const router: Router = express.Router();

router.use('/mock', require('./mock'));

module.exports = router;
