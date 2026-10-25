import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';

const prisma = new PrismaClient({
  datasources: { db: { url: 'file:./test.db' } },
});
const app = createApp(prisma);

beforeAll(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

afterEach(async () => {
  await prisma.user.deleteMany();
});

describe('Username and Email Authentication Support (TDD Red)', () => {
  it('should register a new user with both email and a unique username', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'alex@example.com',
      username: 'alex_racer',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('alex@example.com');
    expect(res.body.user.username).toBe('alex_racer');
    expect(res.body.user.password).toBeUndefined();
  });

  it('should return 409 if username is already in use', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'first@example.com',
      username: 'speedster',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'second@example.com',
      username: 'Speedster', // case-insensitive check
      password: 'password456',
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/username/i);
  });

  it('should allow login using username', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'pilot@example.com',
      username: 'topgun',
      password: 'secretPassword123',
    });

    // Login using username in usernameOrEmail / identifier field
    const res = await request(app).post('/api/auth/login').send({
      usernameOrEmail: 'topgun',
      password: 'secretPassword123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('pilot@example.com');
    expect(res.body.user.username).toBe('topgun');
  });

  it('should allow login using email even when user has a username', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'pilot2@example.com',
      username: 'maverick',
      password: 'secretPassword123',
    });

    const res = await request(app).post('/api/auth/login').send({
      usernameOrEmail: 'pilot2@example.com',
      password: 'secretPassword123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('maverick');
  });

  it('should allow login with case-insensitive and trimmed username', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'pilot3@example.com',
      username: 'viper',
      password: 'secretPassword123',
    });

    const res = await request(app).post('/api/auth/login').send({
      usernameOrEmail: '  VIPER  ',
      password: 'secretPassword123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should preserve existing email-based accounts without a username', async () => {
    // Register without username (legacy client simulation)
    const regRes = await request(app).post('/api/auth/register').send({
      email: 'legacy@example.com',
      password: 'password123',
    });
    expect(regRes.status).toBe(201);

    // Login using email
    const res = await request(app).post('/api/auth/login').send({
      email: 'legacy@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('legacy@example.com');
  });
});
