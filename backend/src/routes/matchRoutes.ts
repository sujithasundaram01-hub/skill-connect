import { Router } from 'express';
import { getSkillMatches } from '../controllers/matchController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getSkillMatches);

export default router;
