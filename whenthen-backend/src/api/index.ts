import express, { Router } from 'express';

const router: Router = express.Router();

router.use('/mock', require('./mock'));
router.use('/auth', require('./auth'));

module.exports = router;
