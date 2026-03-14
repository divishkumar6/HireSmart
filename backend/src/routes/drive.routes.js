import { Router } from 'express';
import {
  getDrives,
  createDrive,
  getDrive,
  updateDrive,
  deleteDrive,
  getDriveStats,
} from '../controllers/drive.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.route('/').get(getDrives).post(createDrive);
router.route('/:id').get(getDrive).put(updateDrive).delete(deleteDrive);
router.get('/:id/stats', getDriveStats);

export default router;
