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
    const newLesson = new Lesson(req.body);
    const savedLesson = await newLesson.save();
    return res.status(201).json(savedLesson);
  } catch (error) {
    return res.status(400).json({ message: "Failed to scribe new lesson", error: error.message });
  }
};