import Lesson from '../models/Lesson.js';

// @desc    Get all lessons for the Explore Page
// @route   GET /api/lessons
// @access  Public (or Private depending on your setup)
export const getLessons = async (req, res) => {
  try {
    // Fetches all lessons and sorts them by newest first
    const lessons = await Lesson.find({}).sort({ createdAt: -1 });
    return res.status(200).json(lessons);
  } catch (error) {
    return res.status(500).json({ 
      message: "The archives are currently locked.", 
      error: error.message 
    });
  }
};

// @desc    Create a new lesson
// @route   POST /api/lessons
// @access  Private/Admin
export const createLesson = async (req, res) => {
  try {
    const lessonData = req.body;
    
    // Auto-generate a URL-friendly slug from the title if one isn't explicitly provided
    if (!lessonData.slug && lessonData.title) {
        lessonData.slug = lessonData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // replace spaces & special chars with hyphens
            .replace(/(^-|-$)+/g, '');   // remove leading/trailing hyphens
    }

    const newLesson = new Lesson(lessonData);
    const savedLesson = await newLesson.save();
    
    return res.status(201).json(savedLesson);
  } catch (error) {
    return res.status(400).json({ 
      message: "Failed to scribe new lesson into the archives.", 
      error: error.message 
    });
  }
};