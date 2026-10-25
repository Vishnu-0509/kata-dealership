import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

describe('Database Migrations Integrity (TDD)', () => {
  const freshDbFile = path.resolve(__dirname, '../prisma/test_migration_fresh.db');
  const freshDbUrl = 'file:./test_migration_fresh.db';

  beforeAll(() => {
    // Ensure clean state before running
    if (fs.existsSync(freshDbFile)) fs.unlinkSync(freshDbFile);
  });

  afterAll(() => {
    if (fs.existsSync(freshDbFile)) fs.unlinkSync(freshDbFile);
    const journal = `${freshDbFile}-journal`;
    if (fs.existsSync(journal)) fs.unlinkSync(journal);
  });

  it('applies all committed migrations cleanly to a fresh database and verifies schema columns', async () => {
    // Run `prisma migrate deploy` on a fresh database
    execSync('npx prisma migrate deploy', {
      cwd: path.resolve(__dirname, '..'),
      env: {
        ...process.env,
        DATABASE_URL: freshDbUrl,
      },
      stdio: 'pipe',
    });

    const prisma = new PrismaClient({
      datasources: { db: { url: freshDbUrl } },
    });

    try {
      // 1. Verify User model includes username column and supports nullable username (existing email accounts)
      const user = await prisma.user.create({
        data: {
          email: 'legacy@dealership.com',
          password: 'hashedpassword',
          role: 'USER',
          username: null,
        },
      });
      expect(user.id).toBeDefined();
      expect(user.username).toBeNull();

      // Verify unique username insertion
      const userWithUsername = await prisma.user.create({
        data: {
          email: 'modern@dealership.com',
          password: 'hashedpassword',
          role: 'USER',
          username: 'modern_driver',
        },
      });
      expect(userWithUsername.username).toBe('modern_driver');

      // 2. Verify Vehicle model includes images360 column
      const vehicle = await prisma.vehicle.create({
        data: {
          make: 'Porsche',
          model: '911 GT3',
          category: 'Coupe',
          price: 195000,
          quantity: 1,
          images360: JSON.stringify(['https://example.com/frame1.jpg', 'https://example.com/frame2.jpg']),
        },
      });
      expect(vehicle.id).toBeDefined();
      expect(vehicle.images360).toContain('frame1.jpg');

      // Query both records back from the fresh database
      const foundUser = await prisma.user.findUnique({ where: { username: 'modern_driver' } });
      expect(foundUser?.email).toBe('modern@dealership.com');

      const foundVeh = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
      expect(foundVeh?.images360).toBe(vehicle.images360);
    } finally {
      await prisma.$disconnect();
    }
  });
});
