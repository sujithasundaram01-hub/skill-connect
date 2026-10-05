import { Router } from 'express';
import {
  getPublicProfile,
  updateProfile,
  changePassword,
  blockUser,
  unblockUser,
  getBlockedUsers,
  requestVerification,
} from '../controllers/userController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/profile/:id', optionalAuthenticateToken, getPublicProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);
router.post('/block', authenticateToken, blockUser);
router.post('/unblock', authenticateToken, unblockUser);
router.get('/blocked', authenticateToken, getBlockedUsers);
router.post('/request-verification', authenticateToken, requestVerification);

export default router;
