import { ApiError } from '@google/genai';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../src/app.js';
import { reviewProject } from '../src/ai/gemini.js';

vi.mock('../src/config/db.js', () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../src/ai/gemini.js', () => ({
  AiReplyError: class AiReplyError extends Error {},
  reviewProject: vi.fn(),
}));

const testJwtSecret = 'test-only-jwt-secret-for-auth-tests';

function tokenFor(userId: string): string {
  return jwt.sign({ userId }, testJwtSecret, { expiresIn: '5m' });
}

describe('POST /api/ai', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', testJwtSecret);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects a request with no token', async () => {
    const response = await request(app)
      .post('/api/ai')
      .send({ prompt: 'A campus lost and found project description.' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authentication required');
  });

  it('rejects a token signed by a different secret', async () => {
    const forgedToken = jwt.sign({ userId: 'student-101' }, 'not-the-test-secret');
    const response = await request(app)
      .post('/api/ai')
      .set('Authorization', `Bearer ${forgedToken}`)
      .send({ prompt: 'A campus lost and found project description.' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid or expired token');
  });

  it('allows a valid token through authentication and validates the request before Gemini', async () => {
    const response = await request(app)
      .post('/api/ai')
      .set('Authorization', `Bearer ${tokenFor('student-101')}`)
      .send({ prompt: 'Too short' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: 'Prompt must be at least 20 characters long' }),
      ]),
    );
    expect(reviewProject).not.toHaveBeenCalled();
  });

  it('explains when Gemini is temporarily unavailable', async () => {
    vi.mocked(reviewProject).mockRejectedValueOnce(
      new ApiError({ status: 503, message: 'Model temporarily unavailable' }),
    );

    const response = await request(app)
      .post('/api/ai')
      .set('Authorization', ['Bearer', tokenFor('student-503')].join(' '))
      .send({ prompt: 'A campus app that helps students find lost belongings.' });

    expect(response.status).toBe(503);
    expect(response.body.message).toBe(
      'The AI service is temporarily busy. Please wait a moment and try again.',
    );
  });
});
