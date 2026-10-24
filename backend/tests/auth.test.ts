/**
 * TDD Tests: Auth Endpoints
 * Written BEFORE implementation (Red phase).
 * These tests define the expected behaviour of /api/auth/register and /api/auth/login.
 */
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app';

// Use test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-jwt-secret-key';

const app = createApp();
const prisma = new PrismaClient();

beforeAll(async () => {
  // Ensure test DB is clean
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

afterEach(async () => {
  await prisma.user.deleteMany();
});

// ─── Registration ────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('should register a new user and return 201 with user data', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.role).toBe('USER');
    // Password must NEVER be returned
    expect(res.body.user.password).toBeUndefined();
  });

  it('should return 409 if email already exists', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'dupe@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'dupe@example.com',
      password: 'anotherpassword',
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/email/i);
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      password: 'password123',
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 if password is shorter than 6 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'short@example.com',
      password: '123',
    });

    expect(res.status).toBe(400);
  });

  it('should hash the password — plaintext must not be stored in DB', async () => {
    const plainPassword = 'mySecretPassword';
    await request(app).post('/api/auth/register').send({
      email: 'hashcheck@example.com',
      password: plainPassword,
    });

    const userInDb = await prisma.user.findUnique({ where: { email: 'hashcheck@example.com' } });
    expect(userInDb).not.toBeNull();
    expect(userInDb!.password).not.toBe(plainPassword);
    expect(userInDb!.password).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt pattern
  });
});

// ─── Login ───────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  const testUser = { email: 'login@example.com', password: 'password123' };

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(testUser);
  });

  it('should return 200 with a JWT token on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send(testUser);

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should return 401 when password is incorrect', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('should return 401 when email does not exist', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(401);
  });
});
