import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app';

const TEST_SECRET = 'media-validation-jwt-secret-key-32chars';
process.env.JWT_SECRET = TEST_SECRET;
process.env.NODE_ENV = 'test';

const prisma = new PrismaClient({
  datasources: { db: { url: 'file:./test.db' } },
});
const app = createApp(prisma);

const adminToken = jwt.sign(
  { userId: 'admin-media', email: 'admin@media.com', role: 'ADMIN' },
  TEST_SECRET
);

describe('Vehicle 360 Media Validation (TDD)', () => {
  beforeEach(async () => {
    await prisma.vehicle.deleteMany();
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.$disconnect();
  });

  it('rejects create vehicle with malformed JSON string in images360 with 400', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        make: 'Porsche',
        model: '911',
        category: 'Coupe',
        price: 100000,
        quantity: 1,
        images360: 'not-valid-json',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/valid JSON array/i);
  });

  it('rejects create vehicle with non-array JSON in images360 with 400', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        make: 'Porsche',
        model: '911',
        category: 'Coupe',
        price: 100000,
        quantity: 1,
        images360: JSON.stringify({ not: 'an-array' }),
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/array/i);
  });

  it('rejects create vehicle with unsupported URL schemes or non-strings in images360 with 400', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        make: 'Porsche',
        model: '911',
        category: 'Coupe',
        price: 100000,
        quantity: 1,
        images360: JSON.stringify(['javascript:alert(1)', 'https://valid.com/frame.jpg']),
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/http.*https/i);
  });

  it('accepts valid ordered sequence of HTTP/HTTPS URLs and preserves order', async () => {
    const frames = [
      'https://example.com/angles/01.jpg',
      'https://example.com/angles/02.jpg',
      'https://example.com/angles/03.jpg',
    ];

    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        make: 'Porsche',
        model: '911 Carrera',
        category: 'Coupe',
        price: 114000,
        quantity: 2,
        images360: JSON.stringify(frames),
      });

    expect(res.status).toBe(201);
    expect(res.body.images360).toBe(JSON.stringify(frames));
  });

  it('allows clearing images360 sequence by submitting null or empty', async () => {
    // Create with sequence
    const initial = await prisma.vehicle.create({
      data: {
        make: 'BMW',
        model: 'M4',
        category: 'Coupe',
        price: 85000,
        quantity: 1,
        images360: JSON.stringify(['https://example.com/1.jpg', 'https://example.com/2.jpg']),
      },
    });

    const updateRes = await request(app)
      .put(`/api/vehicles/${initial.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        images360: null,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.images360).toBeNull();
  });
});
