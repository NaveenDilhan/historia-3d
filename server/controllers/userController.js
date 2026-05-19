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
      unlockedLessons: user.unlockedLessons,
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
      unlockedLessons: updatedUser.unlockedLessons,
      achievements: updatedUser.achievements
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc   Update user achievements from a lesson (and award KP)
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
    let kpEarned = 0;

    // Define KP rewards for medals
    const kpRewards = { gold: 100, silver: 50, bronze: 25 };

    if (existingIndex !== -1) {
      if (eventsFound > user.achievements[existingIndex].eventsFound) {
        user.achievements[existingIndex].eventsFound = eventsFound;
        
        // Award KP if they got a better medal
        if (medal && user.achievements[existingIndex].medal !== medal) {
            kpEarned = kpRewards[medal] || 0;
            user.stats.knowledgePoints += kpEarned;
        }
        
        user.achievements[existingIndex].medal = medal;
        user.achievements[existingIndex].unlockedAt = Date.now();
      }
    } else {
      user.achievements.push({ lessonId, eventsFound, totalEvents, medal });
      user.stats.erasExplored += 1;
      
      // Award KP for first time medal
      if (medal) {
          kpEarned = kpRewards[medal] || 0;
          user.stats.knowledgePoints += kpEarned;
      }
    }

    user.stats.artifactsFound += eventsFound;
    await user.save();
    
    res.status(200).json({ 
      achievements: user.achievements, 
      stats: user.stats,
      kpEarned 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record achievement.', error: error.message });
  }
};

// @desc   Unlock a premium lesson using Knowledge Points
// @route  POST /api/users/unlock-lesson
// @access Private
export const unlockLesson = async (req, res) => {
    try {
        const { lessonSlug, cost } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.unlockedLessons.includes(lessonSlug)) {
            return res.status(400).json({ message: 'Lesson already unlocked' });
        }

        if (user.stats.knowledgePoints < cost) {
            return res.status(400).json({ message: 'Not enough Knowledge Points (KP)' });
        }

        user.stats.knowledgePoints -= cost;
        user.unlockedLessons.push(lessonSlug);
        await user.save();

        res.status(200).json({ 
            unlockedLessons: user.unlockedLessons, 
            stats: user.stats 
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to unlock lesson.', error: error.message });
    }
};