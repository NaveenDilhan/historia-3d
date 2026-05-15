import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { registerUser, loginUser, logoutUser } from './authController.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Mock the User model and jwt using Vitest
vi.mock('../models/User.js');
vi.mock('jsonwebtoken');

describe('Auth Controller (UT-01: User Authentication)', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: { name: 'Leonidas', email: 'leo@sparta.com', password: 'password123' },
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
    };
    process.env.JWT_SECRET = 'test_secret';
    jwt.sign.mockReturnValue('mocked_token');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user and generate a token', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ _id: '1', name: 'Leonidas', email: 'leo@sparta.com' });

      await registerUser(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'leo@sparta.com' });
      expect(User.create).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledWith('jwt', 'mocked_token', expect.any(Object));
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ _id: '1', name: 'Leonidas', email: 'leo@sparta.com' });
    });

    it('should return 400 if user already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'leo@sparta.com' });

      await registerUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });
  });

  describe('loginUser', () => {
    it('should login user and generate token with valid credentials', async () => {
      const mockUser = {
        _id: '1',
        name: 'Leonidas',
        email: 'leo@sparta.com',
        matchPassword: vi.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);

      await loginUser(mockReq, mockRes);

      expect(mockUser.matchPassword).toHaveBeenCalledWith('password123');
      expect(mockRes.cookie).toHaveBeenCalledWith('jwt', 'mocked_token', expect.any(Object));
      expect(mockRes.json).toHaveBeenCalledWith({ _id: '1', name: 'Leonidas', email: 'leo@sparta.com' });
    });

    it('should return 401 with invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      await loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });
  });

  describe('logoutUser', () => {
    it('should clear the jwt cookie', () => {
      logoutUser(mockReq, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith('jwt', '', expect.any(Object));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });
});