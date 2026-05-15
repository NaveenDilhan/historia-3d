import protect from './authMiddleware.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

jest.mock('jsonwebtoken');
jest.mock('../models/User.js');

describe('Auth Middleware (UT-04: API Route Protection)', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      cookies: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    process.env.JWT_SECRET = 'test_secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() if valid token is provided', async () => {
    mockReq.cookies.jwt = 'valid_token';
    jwt.verify.mockReturnValue({ userId: '1' });
    
    const mockUser = { _id: '1', name: 'Scholar' };
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    await protect(mockReq, mockRes, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith('valid_token', 'test_secret');
    expect(mockReq.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    mockReq.cookies.jwt = 'invalid_token';
    jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

    await protect(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not authorized, invalid token' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if no token is provided', async () => {
    await protect(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});