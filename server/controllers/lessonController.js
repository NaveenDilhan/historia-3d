import Lesson from '../models/Lesson.js';

// @desc    Get all lessons (supports optional search/filter queries)
// @route   GET /api/lessons
// @access  Public
export const getLessons = async (req, res) => {
  try {
    const { search, era, region } = req.query;
    let query = {};

  
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } }
        ];
    }
    if (era && era !== 'All') query.era = era;
    if (region && region !== 'All') query.region = region;

    const lessons = await Lesson.find(query).sort({ createdAt: -1 });
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
    
  
    if (!lessonData.slug && lessonData.title) {
        lessonData.slug = lessonData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') 
            .replace(/(^-|-$)+/g, '');   
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