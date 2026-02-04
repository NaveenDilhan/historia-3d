import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  era: { type: String, default: 'Ancient' },
  progress: { type: Number, default: 0 },
  achievements: { type: Number, default: 0 }, // From your image
  readTime: { type: String, default: '15 min read' }
}, { timestamps: true });

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;