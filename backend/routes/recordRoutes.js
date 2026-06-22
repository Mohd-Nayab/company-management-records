import { Router } from 'express';
import {
  getRecords,
  getStats,
  getCompanies,
  getRecordById,
  updateRecord,
  deleteRecord,
  deleteAllRecords,
} from '../controllers/recordController.js';

const router = Router();

router.route('/').get(getRecords).delete(deleteAllRecords);

router.get('/stats', getStats);
router.get('/companies', getCompanies);

router.route('/:id').get(getRecordById).put(updateRecord).delete(deleteRecord);

export default router;
