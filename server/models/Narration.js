import mongoose from 'mongoose';

const narrationSchema = mongoose.Schema({
  userAction: { type: String, required: true },
  context: { type: String, required: true },
  aiResponse: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Narration = mongoose.model('Narration', narrationSchema);
export default Narration;