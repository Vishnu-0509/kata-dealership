import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app';

// Set explicit test secret
const TEST_JWT_SECRET = 'explicit-test-jwt-secret-key-32-chars!!';
process.env.JWT_SECRET = TEST_JWT_SECRET;
process.env.NODE_ENV = 'test';

const prisma = new PrismaClient({
  datasources: { db: { url: 'file:./test.db' } },
});
const app = createApp(prisma);

describe('Security & Authentication Tests (TDD)', () => {
  it('should reject a token forged with the legacy hardcoded fallback-secret', async () => {
    // Attack scenario: Attacker tries to forge an admin token using the known fallback secret
    const forgedToken = jwt.sign(
      { userId: 'hacked-id', email: 'attacker@evil.com', role: 'ADMIN' },
      'fallback-secret'
    );

    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${forgedToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid or expired token/i);
  });

  it('should reject an expired token', async () => {
    const expiredToken = jwt.sign(
      { userId: 'user-1', email: 'user@dealership.com', role: 'USER' },
      TEST_JWT_SECRET,
      { expiresIn: '-10s' } // Expired 10 seconds ago
    );

    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid or expired token/i);
  });

  it('should reject a token with an invalid signature', async () => {
    const tamperedToken = jwt.sign(
      { userId: 'user-1', email: 'user@dealership.com', role: 'USER' },
      'wrong-secret-key-signature'
    );

    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${tamperedToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid or expired token/i);
  });

  it('should reject non-admin users from admin-restricted routes with 403', async () => {
    const userToken = jwt.sign(
      { userId: 'user-regular', email: 'regular@dealership.com', role: 'USER' },
      TEST_JWT_SECRET
    );

    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        make: 'Porsche',
        model: '911 Carrera',
        category: 'Coupe',
        price: 114000,
        quantity: 1,
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/admin access required/i);
  });

  it('should fail configuration startup when JWT_SECRET is missing', () => {
    // Dynamic import of the env config module should throw when JWT_SECRET is missing
    const { validateEnv } = require('../src/config/env');
    expect(() => validateEnv({})).toThrow(/JWT_SECRET.*required|missing/i);
  });
});
