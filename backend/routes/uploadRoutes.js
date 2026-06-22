import { Router } from 'express';
import upload from '../middlewares/upload.js';
import { uploadCsv } from '../controllers/recordController.js';
import { uploadLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/', uploadLimiter, upload.single('file'), uploadCsv);

export default router;
