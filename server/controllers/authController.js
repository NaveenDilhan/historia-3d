import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true, 
    secure: process.env.NODE_ENV !== 'development', 
    sameSite: 'strict', 
    maxAge: 30 * 24 * 60 * 60 * 1000, 
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { firstName, lastName, username, email, password, age, experienceLevel, historicalInterests } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      if (userExists.email === email) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password,
      age: age || null,
      experienceLevel: experienceLevel || 'Beginner',
      historicalInterests: historicalInterests || []
    });

    if (user) {
      generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`, 
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        experienceLevel: user.experienceLevel,
        avatarSeed: user.avatarSeed,
        avatarOptions: user.avatarOptions
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({ 
        $or: [ { email: identifier }, { username: identifier } ] 
    });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      res.json({
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        avatarSeed: user.avatarSeed,
        avatarOptions: user.avatarOptions
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};