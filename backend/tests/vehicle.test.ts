/**
 * TDD Tests: Vehicle Endpoints
 * Written BEFORE implementation (Red phase).
 * These tests define the expected behaviour of /api/vehicles/* endpoints.
 */
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-jwt-secret-key';

const app = createApp();
const prisma = new PrismaClient();

// Test users
const adminUser = { email: 'admin@test.com', password: 'password123' };
const regularUser = { email: 'user@test.com', password: 'password123' };

let adminToken: string;
let userToken: string;

// Sample vehicle data
const sampleVehicle = {
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  price: 25000,
  quantity: 5,
};

beforeAll(async () => {
  await prisma.user.deleteMany();
  await prisma.vehicle.deleteMany();

  // Register admin and promote to ADMIN in DB
  await request(app).post('/api/auth/register').send(adminUser);
  await prisma.user.update({
    where: { email: adminUser.email },
    data: { role: 'ADMIN' },
  });

  // Register regular user
  await request(app).post('/api/auth/register').send(regularUser);

  // Log in both
  const adminLogin = await request(app).post('/api/auth/login').send(adminUser);
  adminToken = adminLogin.body.token;

  const userLogin = await request(app).post('/api/auth/login').send(regularUser);
  userToken = userLogin.body.token;
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.$disconnect();
});

afterEach(async () => {
  await prisma.vehicle.deleteMany();
});

// ─── GET /api/vehicles ────────────────────────────────────────────────────────

describe('GET /api/vehicles', () => {
  it('should return 401 without a token', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });

  it('should return empty array when no vehicles exist', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('should return all vehicles', async () => {
    await prisma.vehicle.createMany({
      data: [sampleVehicle, { ...sampleVehicle, make: 'Honda', model: 'Civic' }],
    });

    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });
});

// ─── GET /api/vehicles/search ─────────────────────────────────────────────────

describe('GET /api/vehicles/search', () => {
  beforeEach(async () => {
    await prisma.vehicle.createMany({
      data: [
        { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 25000, quantity: 3 },
        { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 35000, quantity: 2 },
        { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 5 },
        { make: 'BMW', model: 'X5', category: 'SUV', price: 75000, quantity: 1 },
      ],
    });
  });

  it('should filter by make', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Toyota')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body.every((v: { make: string }) => v.make === 'Toyota')).toBe(true);
  });

  it('should filter by category', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?category=SUV')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('should filter by price range', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?minPrice=30000&maxPrice=80000')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body.every((v: { price: number }) => v.price >= 30000 && v.price <= 80000)).toBe(true);
  });

  it('should return empty array for no matches', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Ferrari')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });
});

// ─── POST /api/vehicles ───────────────────────────────────────────────────────

describe('POST /api/vehicles', () => {
  it('should return 403 if a regular user tries to create a vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(sampleVehicle);

    expect(res.status).toBe(403);
  });

  it('should allow admin to create a vehicle and return 201', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sampleVehicle);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.make).toBe(sampleVehicle.make);
    expect(res.body.model).toBe(sampleVehicle.model);
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Toyota' });

    expect(res.status).toBe(400);
  });
});

// ─── PUT /api/vehicles/:id ────────────────────────────────────────────────────

describe('PUT /api/vehicles/:id', () => {
  let vehicleId: string;

  beforeEach(async () => {
    const v = await prisma.vehicle.create({ data: sampleVehicle });
    vehicleId = v.id;
  });

  it('should update a vehicle and return 200', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 27000 });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(27000);
  });

  it('should return 404 for a non-existent vehicle', async () => {
    const res = await request(app)
      .put('/api/vehicles/non-existent-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 27000 });

    expect(res.status).toBe(404);
  });

  it('should return 403 if a regular user tries to update', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 27000 });

    expect(res.status).toBe(403);
  });
});

// ─── DELETE /api/vehicles/:id ─────────────────────────────────────────────────

describe('DELETE /api/vehicles/:id', () => {
  let vehicleId: string;

  beforeEach(async () => {
    const v = await prisma.vehicle.create({ data: sampleVehicle });
    vehicleId = v.id;
  });

  it('should delete a vehicle and return 200', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const deleted = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    expect(deleted).toBeNull();
  });

  it('should return 403 if a regular user tries to delete', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('should return 404 for non-existent vehicle', async () => {
    const res = await request(app)
      .delete('/api/vehicles/no-such-id')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});

// ─── POST /api/vehicles/:id/purchase ─────────────────────────────────────────

describe('POST /api/vehicles/:id/purchase', () => {
  it('should purchase a vehicle and decrement quantity by 1', async () => {
    const vehicle = await prisma.vehicle.create({ data: { ...sampleVehicle, quantity: 3 } });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.vehicle.quantity).toBe(2);
  });

  it('should return 400 if vehicle is out of stock', async () => {
    const vehicle = await prisma.vehicle.create({ data: { ...sampleVehicle, quantity: 0 } });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/out of stock/i);
  });

  it('should return 404 for non-existent vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles/ghost-id/purchase')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
  });
});

// ─── POST /api/vehicles/:id/restock ──────────────────────────────────────────

describe('POST /api/vehicles/:id/restock', () => {
  it('should restock a vehicle and increase quantity', async () => {
    const vehicle = await prisma.vehicle.create({ data: { ...sampleVehicle, quantity: 2 } });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(200);
    expect(res.body.vehicle.quantity).toBe(12);
  });

  it('should return 403 if a regular user tries to restock', async () => {
    const vehicle = await prisma.vehicle.create({ data: sampleVehicle });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(403);
  });

  it('should return 400 if restock quantity is not positive', async () => {
    const vehicle = await prisma.vehicle.create({ data: sampleVehicle });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: -5 });

    expect(res.status).toBe(400);
  });
});
