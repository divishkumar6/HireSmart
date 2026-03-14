import { Router } from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import { analyzeResume } from '../controllers/ats.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (['application/pdf', 'text/plain'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and TXT files allowed'));
  },
});

const router = Router();
router.use(protect);
router.post('/analyze', upload.single('resume'), analyzeResume);

export default router;
