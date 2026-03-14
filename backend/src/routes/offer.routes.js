import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { generateOffer, updateCandidateStatus } from '../controllers/offer.controller.js';
const router = Router();
router.use(protect);
router.get('/:candidateId/generate', generateOffer);
router.put('/:candidateId/status', updateCandidateStatus);
export default router;
