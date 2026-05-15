import express from 'express';
import { getLessons, createLesson } from '../controllers/lessonController.js';


const router = express.Router();


router.route('/')
  .get(getLessons)
  .post(createLesson); 

export default router;