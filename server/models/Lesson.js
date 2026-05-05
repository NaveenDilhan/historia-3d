import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, 
  
  // Categorization Fields
  era: { type: String, default: 'Ancient' },         // e.g., "Mesozoic", "Precambrian"
  region: { type: String, default: 'Global' },       // e.g., "North America", "Egypt", "Global"
  tags: [{ type: String }],                          // e.g., ["Dinosaurs", "Asteroid", "Oceans"]
  
  totalEvents: { type: Number, default: 0 }, 
  progress: { type: Number, default: 0 },
  achievements: { type: Number, default: 0 }, 
  readTime: { type: String, default: '15 min read' }
}, { timestamps: true });

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;