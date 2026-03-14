import { Router } from 'express';
import {
  getCandidates, addCandidate, getCandidate, updateCandidate,
  deleteCandidate, updateScores, getDriveRankings, getSkillHeatmap, getDashboardStats,
  bulkImport
} from '../controllers/candidate.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/heatmap', getSkillHeatmap);
router.post('/bulk-import', bulkImport);
router.get('/dashboard-stats', getDashboardStats);
router.route('/').get(getCandidates).post(addCandidate);
router.route('/:id').get(getCandidate).put(updateCandidate).delete(deleteCandidate);
router.put('/:id/scores', updateScores);
router.get('/drive/:driveId/rankings', getDriveRankings);

export default router;
