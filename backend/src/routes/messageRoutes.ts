import { Router } from 'express';
import {
  getMessagesByConnection,
  sendMessage,
} from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/:connectionId', getMessagesByConnection);
router.post('/:connectionId', sendMessage);

export default router;
