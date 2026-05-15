import User from '../models/User.js';

// @desc   Get user profile
// @route  GET /api/users/profile
// @access Private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarSeed: user.avatarSeed,
      title: user.title,
      bio: user.bio,
      stats: user.stats,
      achievements: user.achievements
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc   Update user profile
// @route  PUT /api/users/profile
// @access Private
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;
    user.avatarSeed = req.body.avatarSeed || user.avatarSeed;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatarSeed: updatedUser.avatarSeed,
      title: updatedUser.title,
      bio: updatedUser.bio,
      stats: updatedUser.stats,
      achievements: updatedUser.achievements
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc   Update user achievements from a lesson
// @route  POST /api/users/achievements
// @access Private
export const updateAchievements = async (req, res) => {
  try {
    const { lessonId, eventsFound, totalEvents, medal } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingIndex = user.achievements.findIndex(a => a.lessonId === lessonId);

    if (existingIndex !== -1) {
      
      if (eventsFound > user.achievements[existingIndex].eventsFound) {
        user.achievements[existingIndex].eventsFound = eventsFound;
        user.achievements[existingIndex].medal = medal;
        user.achievements[existingIndex].unlockedAt = Date.now();
      }
    } else {
      
      user.achievements.push({ lessonId, eventsFound, totalEvents, medal });
      user.stats.erasExplored += 1;
    }

    
    user.stats.artifactsFound += eventsFound;
    
    await user.save();
    
    res.status(200).json({ 
      achievements: user.achievements, 
      stats: user.stats 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record achievement.', error: error.message });
  }
};