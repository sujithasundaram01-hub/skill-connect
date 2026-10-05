import { Router } from 'express';
import { createReport } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.post('/', createReport);

export default router;
