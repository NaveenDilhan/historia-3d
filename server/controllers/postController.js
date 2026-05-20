import Post from '../models/Post.js';

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username firstName lastName avatarSeed')
      .populate('comments.author', 'username firstName lastName avatarSeed')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching posts', error: error.message });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username firstName lastName avatarSeed')
      .populate('comments.author', 'username firstName lastName avatarSeed');
      
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching post', error: error.message });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { title, content, era, authorName, authorAvatar } = req.body;
    
    // Construct the relative image URL (Better for deployments & reverse proxies)
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const post = new Post({
      author: req.user._id, // Set by authMiddleware
      // Fix: Use username if name is not explicitly passed from frontend
      authorName: authorName || req.user.username || `${req.user.firstName} ${req.user.lastName}`,
      authorAvatar: authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user.avatarSeed || req.user.username}`,
      title,
      content,
      era: era || 'e/General',
      imageUrl,
      upvotes: [req.user._id], // Automatically upvote own post
      score: 1
    });

    const createdPost = await post.save();
    
    // Populate the author data before sending to frontend
    await createdPost.populate('author', 'username firstName lastName avatarSeed');
    
    res.status(201).json(createdPost);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
};

// @desc    Vote on a post
// @route   POST /api/posts/:id/vote
// @access  Private
export const votePost = async (req, res) => {
  try {
    const { direction } = req.body; // 1 for upvote, -1 for downvote
    const post = await Post.findById(req.params.id);
    const userId = req.user._id;

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const hasUpvoted = post.upvotes.includes(userId);
    const hasDownvoted = post.downvotes.includes(userId);

    // Remove user from both arrays first to reset their state
    post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
    post.downvotes = post.downvotes.filter(id => id.toString() !== userId.toString());

    if (direction === 1) {
      // If they hadn't upvoted already, add the upvote
      if (!hasUpvoted) post.upvotes.push(userId);
    } else if (direction === -1) {
      // If they hadn't downvoted already, add the downvote
      if (!hasDownvoted) post.downvotes.push(userId);
    }

    // Recalculate score (Upvotes - Downvotes)
    post.score = post.upvotes.length - post.downvotes.length;

    await post.save();
    
    // Return arrays so the frontend knows the active state of the buttons
    res.json({ 
      message: 'Vote recorded', 
      score: post.score,
      upvotes: post.upvotes,
      downvotes: post.downvotes 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to vote', error: error.message });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      author: req.user._id,
      // Fix: Used username since req.user.name doesn't exist on your schema
      authorName: req.user.username || `${req.user.firstName} ${req.user.lastName}`,
      text,
    };

    post.comments.push(newComment);
    await post.save();
    
    // Populate the newly added comment's author data
    await post.populate('comments.author', 'username firstName lastName avatarSeed');

    // Return the updated comments array
    res.status(201).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
};