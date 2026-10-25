import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app';

const TEST_SECRET = 'validation-test-jwt-secret-32-chars';
process.env.JWT_SECRET = TEST_SECRET;
process.env.NODE_ENV = 'test';

const prisma = new PrismaClient({
  datasources: { db: { url: 'file:./test.db' } },
});
const app = createApp(prisma);

const userToken = jwt.sign(
  { userId: 'user-val', email: 'user@val.com', role: 'USER' },
  TEST_SECRET
);
const adminToken = jwt.sign(
  { userId: 'admin-val', email: 'admin@val.com', role: 'ADMIN' },
  TEST_SECRET
);

describe('API Input Validation & Model Search (TDD)', () => {
  beforeEach(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.vehicle.createMany({
      data: [
        {
          make: 'Porsche',
          model: '911 Carrera',
          category: 'Coupe',
          price: 114000,
          quantity: 2,
        },
        {
          make: 'BMW',
          model: 'M3 Competition',
          category: 'Sedan',
          price: 80000,
          quantity: 3,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.$disconnect();
  });

  describe('Search Query Parameter Validation', () => {
    it('returns 400 when minPrice is not a valid number (e.g. minPrice=abc)', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=abc')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/validation error/i);
    });

    it('returns 400 when minPrice contains junk characters (e.g. minPrice=10junk)', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=10junk')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/validation error/i);
    });

    it('returns 400 when maxPrice is not a valid number', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?maxPrice=xyz')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/validation error/i);
    });

    it('returns 400 when array-valued filters are passed (e.g. make[]=Audit)', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make[]=Audit')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/validation error/i);
    });

    it('returns 400 when price bounds are negative', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=-500')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/validation error/i);
    });

    it('returns 400 when minPrice exceeds maxPrice', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=100000&maxPrice=50000')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/validation error|price/i);
    });

    it('successfully filters by model name', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?model=Carrera')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].model).toBe('911 Carrera');
    });
  });

  describe('Vehicle Creation Input Validation', () => {
    it('rejects vehicle creation when make is whitespace-only', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: '   ',
          model: 'Valid Model',
          category: 'Sedan',
          price: 25000,
          quantity: 2,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/validation error/i);
    });

    it('rejects vehicle creation when model is whitespace-only', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'Valid Make',
          model: '   ',
          category: 'Sedan',
          price: 25000,
          quantity: 2,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/validation error/i);
    });

    it('rejects vehicle creation when category is whitespace-only', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'Valid Make',
          model: 'Valid Model',
          category: '   ',
          price: 25000,
          quantity: 2,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/validation error/i);
    });
  });
});
