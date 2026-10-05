import { Router } from 'express';
import {
  getMyConnections,
  getConnectionById,
  updateConnectionStatus,
} from '../controllers/connectionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getMyConnections);
router.get('/:id', getConnectionById);
router.patch('/:id/status', updateConnectionStatus);

export default router;
