import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllUsers, toggleUserStatus, changeUserRole,
  deleteUser, getAnalytics, getSystemStats,
  getPendingUsers, approveUser, rejectUser
} from '../controllers/admin.controller.js';

const router = Router();
router.use(protect);
const adminOnly = authorize('admin');

router.get('/analytics', getAnalytics);   // accessible to all (scoped per role in controller)
router.get('/system-stats', getSystemStats);

// Admin-only below
router.get('/users', adminOnly, getAllUsers);
router.put('/users/:id/toggle-status', adminOnly, toggleUserStatus);
router.put('/users/:id/role', adminOnly, changeUserRole);
router.delete('/users/:id', adminOnly, deleteUser);
router.get('/pending-users', adminOnly, getPendingUsers);
router.put('/users/:id/approve', adminOnly, approveUser);
router.put('/users/:id/reject', adminOnly, rejectUser);

export default router;
