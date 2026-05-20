import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  text: { type: String, required: true },
  score: { type: Number, default: 0 },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  authorAvatar: { type: String },
  title: { type: String, required: true },
  content: { type: String, required: true },
  era: { type: String, default: 'e/General' },
  imageUrl: { type: String },
  
  // Voting System
  score: { type: Number, default: 1 },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  comments: [commentSchema]
}, { 
  timestamps: true 
});

const Post = mongoose.model('Post', postSchema);
export default Post;