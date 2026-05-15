import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getNarration } from './narrationController.js';
import { openai } from '../utils/openaiClient.js';
import Narration from '../models/Narration.js';

vi.mock('../utils/openaiClient.js', () => ({
  openai: {
    chat: { completions: { create: vi.fn() } },
  },
}));
vi.mock('../models/Narration.js');

describe('Narration Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {
        userAction: 'Clicked on T-Rex Fossil',
        context: 'Jurassic Era Biome, user level 3',
      },
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return AI narration and save to database', async () => {
    const mockAIResponse = 'The T-Rex was a formidable predator of the Late Cretaceous period.';
    
    openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: mockAIResponse } }],
    });

    Narration.prototype.save = vi.fn().mockResolvedValue(true);

    await getNarration(mockReq, mockRes);

    expect(openai.chat.completions.create).toHaveBeenCalled();
    expect(Narration.prototype.save).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({ narration: mockAIResponse });
  });

  it('should return 400 if userAction or context is missing', async () => {
    mockReq.body = {}; // Empty body

    await getNarration(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing userAction or context in request body.' });
  });

  it('should handle API errors and return 500', async () => {
    openai.chat.completions.create.mockRejectedValue(new Error('OpenAI API Quota Exceeded'));

    await getNarration(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'OpenAI API Quota Exceeded' });
  });
});