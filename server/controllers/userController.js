import User from '../models/User.js';

// @desc   Get user profile
// @route  GET /api/users/profile
// @access Private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      avatarSeed: user.avatarSeed,
      avatarOptions: user.avatarOptions,
      title: user.title,
      bio: user.bio,
      age: user.age,
      experienceLevel: user.experienceLevel,
      historicalInterests: user.historicalInterests,
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
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    
    if (req.body.username && req.body.username !== user.username) {
        const usernameExists = await User.findOne({ username: req.body.username });
        if (usernameExists) {
            return res.status(400).json({ message: 'Username is already taken' });
        }
        user.username = req.body.username;
    }

    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;
    user.avatarSeed = req.body.avatarSeed || user.avatarSeed;
    if (req.body.avatarOptions) user.avatarOptions = req.body.avatarOptions;
    
    if (req.body.age !== undefined) user.age = req.body.age;
    if (req.body.experienceLevel) user.experienceLevel = req.body.experienceLevel;
    if (req.body.historicalInterests) user.historicalInterests = req.body.historicalInterests;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      email: updatedUser.email,
      avatarSeed: updatedUser.avatarSeed,
      avatarOptions: updatedUser.avatarOptions,
      title: updatedUser.title,
      bio: updatedUser.bio,
      age: updatedUser.age,
      experienceLevel: updatedUser.experienceLevel,
      historicalInterests: updatedUser.historicalInterests,
      stats: updatedUser.stats,
      unlockedLessons: updatedUser.unlockedLessons,
      achievements: updatedUser.achievements
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export const updateAchievements = async (req, res) => {
  try {
    const { lessonId, eventsFound, totalEvents, medal } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const existingIndex = user.achievements.findIndex(a => a.lessonId === lessonId);
    let kpEarned = 0;
    const kpRewards = { gold: 100, silver: 50, bronze: 25 };

    if (existingIndex !== -1) {
      if (eventsFound > user.achievements[existingIndex].eventsFound) {
        user.achievements[existingIndex].eventsFound = eventsFound;
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
      if (medal) {
          kpEarned = kpRewards[medal] || 0;
          user.stats.knowledgePoints += kpEarned;
      }
    }

    user.stats.artifactsFound += eventsFound;
    await user.save();
    res.status(200).json({ achievements: user.achievements, stats: user.stats, kpEarned });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record achievement.', error: error.message });
  }
};

export const unlockLesson = async (req, res) => {
    try {
        const { lessonSlug, cost } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.unlockedLessons.includes(lessonSlug)) return res.status(400).json({ message: 'Lesson already unlocked' });
        if (user.stats.knowledgePoints < cost) return res.status(400).json({ message: 'Not enough Knowledge Points (KP)' });

        user.stats.knowledgePoints -= cost;
        user.unlockedLessons.push(lessonSlug);
        await user.save();
        res.status(200).json({ unlockedLessons: user.unlockedLessons, stats: user.stats });
    } catch (error) {
        res.status(500).json({ message: 'Failed to unlock lesson.', error: error.message });
    }
};

export const purchaseKP = async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

        user.stats.knowledgePoints += amount;
        await user.save();
        res.status(200).json({ message: `Successfully acquired ${amount} KP`, stats: user.stats });
    } catch (error) {
        res.status(500).json({ message: 'Failed to process transaction.', error: error.message });
    }
};