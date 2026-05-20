import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getPosts, getPostById, createPost, votePost, addComment } from '../controllers/postController.js';
import  protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Ensure the 'uploads' directory exists relative to where the server starts
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for image uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `scroll-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      return cb(new Error('Please upload an image file'));
    }
    cb(null, true);
  }
});

// Post Base Routes
router.route('/')
  .get(getPosts)
  .post(protect, upload.single('image'), createPost);

// Single Post Routes
router.route('/:id')
  .get(getPostById);

// Voting & Comment Interactions
router.route('/:id/vote')
  .post(protect, votePost);

router.route('/:id/comments')
  .post(protect, addComment);

export default router;