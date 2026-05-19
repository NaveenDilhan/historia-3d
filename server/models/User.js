import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Profile fields
  avatarSeed: { type: String, default: 'Scholar' },
  title: { type: String, default: 'Novice Chronicler' },
  bio: { type: String, default: 'A seeker of ancient truths.' },
  stats: {
    erasExplored: { type: Number, default: 0 },
    artifactsFound: { type: Number, default: 0 },
    knowledgePoints: { type: Number, default: 0 }
  },
  
  // Track bought premium lessons by slug
  unlockedLessons: [{ type: String }],

  // Achievement tracking
  achievements: [{
    lessonId: { type: String, required: true },
    medal: { type: String, enum: ['gold', 'silver', 'bronze', null] },
    eventsFound: { type: Number, default: 0 },
    totalEvents: { type: Number, default: 0 },
    unlockedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;