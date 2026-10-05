import { Router } from 'express';
import {
  createReview,
  getReviewsForUser,
} from '../controllers/reviewController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticateToken, createReview);
router.get('/user/:userId', optionalAuthenticateToken, getReviewsForUser);

export default router;
