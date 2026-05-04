import express from 'express';
import { getLessons, createLesson } from '../controllers/lessonController.js';
// Optional: import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Route: /api/lessons
router.route('/')
  .get(getLessons)
  .post(createLesson); // You can add protect/admin middleware here if you want to restrict creation

export default router;