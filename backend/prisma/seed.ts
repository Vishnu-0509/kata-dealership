import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with high-resolution imagery and specs...');

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

  // Seed Vehicles with Photos and Years
  const vehicles = [
    {
      make: 'Porsche',
      model: '911 Carrera',
      category: 'Coupe',
      year: 2024,
      price: 114400,
      quantity: 2,
      imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
    },
    {
      make: 'BMW',
      model: 'M4 Competition',
      category: 'Coupe',
      year: 2024,
      price: 82200,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
    },
    {
      make: 'Tesla',
      model: 'Model 3 Performance',
      category: 'Electric',
      year: 2024,
      price: 52990,
      quantity: 4,
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
    },
    {
      make: 'Rivian',
      model: 'R1S Adventure',
      category: 'SUV',
      year: 2024,
      price: 78000,
      quantity: 0, // Out of stock to demonstrate disabled state
      imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    },
    {
      make: 'Ford',
      model: 'F-150 Lightning',
      category: 'Truck',
      year: 2023,
      price: 62000,
      quantity: 3,
      imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
    },
    {
      make: 'Toyota',
      model: 'RAV4 Hybrid',
      category: 'SUV',
      year: 2024,
      price: 34500,
      quantity: 8,
      imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
    },
    {
      make: 'Honda',
      model: 'Civic Sport',
      category: 'Sedan',
      year: 2023,
      price: 26500,
      quantity: 10,
      imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
    },
    {
      make: 'Volkswagen',
      model: 'ID. Buzz',
      category: 'Van',
      year: 2024,
      price: 59995,
      quantity: 5,
      imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.create({ data: v });
  }

  console.log(`🚗 Seeded ${vehicles.length} demo vehicles with imagery.`);
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
