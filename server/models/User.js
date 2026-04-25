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
  }
}, { timestamps: true });

// ✅ FIXED: Removed 'next' parameter
userSchema.pre('save', async function () {
  // If password is not modified, simply return (exits the function)
  if (!this.isModified('password')) return;

  // Otherwise, hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;