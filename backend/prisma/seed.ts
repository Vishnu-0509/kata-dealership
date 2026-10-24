import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // Seed Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@dealership.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@dealership.com',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log(`👤 Created users: Admin (${admin.email}), User (${user.email})`);

  // Seed Vehicles
  const vehicles = [
    {
      make: 'Tesla',
      model: 'Model 3 Performance',
      category: 'Electric',
      price: 52990,
      quantity: 4,
    },
    {
      make: 'Toyota',
      model: 'RAV4 Hybrid',
      category: 'SUV',
      price: 34500,
      quantity: 8,
    },
    {
      make: 'Ford',
      model: 'F-150 Lightning',
      category: 'Truck',
      price: 62000,
      quantity: 3,
    },
    {
      make: 'Honda',
      model: 'Civic Sport',
      category: 'Sedan',
      price: 26500,
      quantity: 10,
    },
    {
      make: 'Porsche',
      model: '911 Carrera',
      category: 'Coupe',
      price: 114400,
      quantity: 2,
    },
    {
      make: 'Rivian',
      model: 'R1S Adventure',
      category: 'SUV',
      price: 78000,
      quantity: 0, // Out of stock to test disabled purchase
    },
    {
      make: 'BMW',
      model: 'M4 Competition',
      category: 'Coupe',
      price: 82200,
      quantity: 1,
    },
    {
      make: 'Volkswagen',
      model: 'ID. Buzz',
      category: 'Van',
      price: 59995,
      quantity: 5,
    },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.create({ data: v });
  }

  console.log(`🚗 Seeded ${vehicles.length} demo vehicles.`);
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
