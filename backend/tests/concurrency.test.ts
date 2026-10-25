import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app';

const TEST_SECRET = 'test-concurrency-secret-key-32-chars';
process.env.JWT_SECRET = TEST_SECRET;
process.env.NODE_ENV = 'test';

const prisma = new PrismaClient({
  datasources: { db: { url: 'file:./test.db' } },
});
const app = createApp(prisma);

const userToken = jwt.sign(
  { userId: 'concurrency-user', email: 'buyer@test.com', role: 'USER' },
  TEST_SECRET
);

describe('Concurrent Purchase Stock Protection (TDD)', () => {
  let vehicleId: string;

  beforeEach(async () => {
    await prisma.vehicle.deleteMany();

    // Create a vehicle with exactly 1 unit in stock
    const vehicle = await prisma.vehicle.create({
      data: {
        make: 'Porsche',
        model: '911 GT3 RS',
        category: 'Coupe',
        price: 225000,
        quantity: 1,
      },
    });
    vehicleId = vehicle.id;
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.$disconnect();
  });

  it('should allow exactly 1 purchase and reject 4 concurrent attempts with 0 final stock', async () => {
    // Fire 5 simultaneous purchases against a single remaining stock item
    const purchaseRequests = Array.from({ length: 5 }, () =>
      request(app)
        .post(`/api/vehicles/${vehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
    );

    const responses = await Promise.all(purchaseRequests);

    const successResponses = responses.filter((r) => r.status === 200);
    const rejectedResponses = responses.filter((r) => r.status === 400);

    // Exactly 1 must succeed
    expect(successResponses.length).toBe(1);
    expect(successResponses[0].body.vehicle.quantity).toBe(0);

    // The other 4 must be rejected with out of stock error
    expect(rejectedResponses.length).toBe(4);
    rejectedResponses.forEach((r) => {
      expect(r.body.message).toMatch(/out of stock/i);
    });

    // Check DB directly: stock must be exactly 0, never negative
    const dbVehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    expect(dbVehicle).not.toBeNull();
    expect(dbVehicle!.quantity).toBe(0);
  });
});
