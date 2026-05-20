import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Profile fields
  avatarSeed: { type: String, default: 'Scholar' },
  avatarOptions: {
    skinColor: { type: String, default: 'f8d25c' },
    top: { type: String, default: 'shortFlat' }, // Fixed default value
    accessories: { type: String, default: 'none' }
  },
  title: { type: String, default: 'Novice Chronicler' },
  bio: { type: String, default: 'A seeker of ancient truths.' },
  
  // Personalization fields
  age: { type: Number, required: false },
  experienceLevel: { 
    type: String, 
    enum: ['Beginner', 'Enthusiast', 'Scholar'], 
    default: 'Beginner' 
  },
  historicalInterests: [{ type: String }],

  stats: {
    erasExplored: { type: Number, default: 0 },
    artifactsFound: { type: Number, default: 0 },
    knowledgePoints: { type: Number, default: 0 }
  },
  unlockedLessons: [{ type: String }],
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