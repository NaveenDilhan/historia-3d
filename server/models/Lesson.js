import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // Added slug for routing
  era: { type: String, default: 'Ancient' },
  progress: { type: Number, default: 0 },
  achievements: { type: Number, default: 0 },
  readTime: { type: String, default: '15 min read' }
}, { timestamps: true });

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;