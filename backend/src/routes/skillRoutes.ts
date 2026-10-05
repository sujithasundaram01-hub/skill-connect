import { Router } from 'express';
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  getSkillOfTheDay,
  getNearbySkills,
  toggleSaveSkill,
  getSavedSkills,
} from '../controllers/skillController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuthenticateToken, getAllSkills);
router.get('/day', getSkillOfTheDay);
router.get('/nearby', optionalAuthenticateToken, getNearbySkills);
router.get('/saved', authenticateToken, getSavedSkills);
router.post('/save', authenticateToken, toggleSaveSkill);
router.get('/:id', optionalAuthenticateToken, getSkillById);
router.post('/', authenticateToken, createSkill);
router.put('/:id', authenticateToken, updateSkill);
router.delete('/:id', authenticateToken, deleteSkill);

export default router;
