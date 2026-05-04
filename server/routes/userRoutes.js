import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  updateAchievements 
} from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply 'protect' middleware to secure these routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Route for logging completed lesson achievements
router.route('/achievements')
  .post(protect, updateAchievements);

export default router;