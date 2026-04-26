import Lesson from '../models/Lesson.js';

export const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({}).sort({ createdAt: -1 });
    return res.status(200).json(lessons);
  } catch (error) {
    return res.status(500).json({ message: "The archives are currently locked", error: error.message });
  }
};

export const createLesson = async (req, res) => {
  try {
    const lessonData = req.body;
    
    // Auto-generate a slug from the title if one isn't provided
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
    return res.status(400).json({ message: "Failed to scribe new lesson", error: error.message });
  }
};