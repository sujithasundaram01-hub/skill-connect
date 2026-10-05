import { Router } from 'express';
import {
  getAdminStats,
  getReports,
  updateReportStatus,
  toggleUserSuspension,
  getAllUsersAdmin,
} from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/stats', getAdminStats);
router.get('/reports', getReports);
router.patch('/reports/:id', updateReportStatus);
router.patch('/users/:userId/suspend', toggleUserSuspension);
router.get('/users', getAllUsersAdmin);

export default router;
