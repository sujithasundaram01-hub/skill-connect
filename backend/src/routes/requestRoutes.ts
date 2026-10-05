import { Router } from 'express';
import {
  createRequest,
  getMySentRequests,
  getMyReceivedRequests,
  updateRequestStatus,
} from '../controllers/requestController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/', createRequest);
router.get('/sent', getMySentRequests);
router.get('/received', getMyReceivedRequests);
router.patch('/:id/status', updateRequestStatus);

export default router;
