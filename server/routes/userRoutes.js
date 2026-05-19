import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  updateAchievements,
  unlockLesson
} from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/achievements')
  .post(protect, updateAchievements);

router.route('/unlock-lesson')
  .post(protect, unlockLesson);

export default router;