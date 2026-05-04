import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // Used for routing (e.g., /scene/jurassic)
  era: { type: String, default: 'Ancient' },
  
  // Total number of interactable artifacts/events in this specific lesson
  totalEvents: { type: Number, default: 0 }, 
  
  // Base display values (Can be overridden by user's personal stats on the frontend)
  progress: { type: Number, default: 0 },
  achievements: { type: Number, default: 0 }, 
  readTime: { type: String, default: '15 min read' }
}, { timestamps: true });

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;