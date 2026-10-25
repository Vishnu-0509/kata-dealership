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
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@dealership.com',
      username: 'user',
      password: userPassword,
      role: 'USER',
    },
  });

  const demoPassword = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@dealership.com',
      username: 'demo',
      password: demoPassword,
      role: 'DEMO',
    },
  });

  console.log(`👤 Created users: Admin (${admin.email}), User (${user.email}), Demo Client (${demoUser.email})`);

  // Seed Vehicles with High-Res Photos, Specs and Years
  const vehicles = [
    {
      make: 'Porsche',
      model: '911 Carrera',
      category: 'Coupe',
      year: 2024,
      price: 114400,
      quantity: 2,
      imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
      bhp: 379,
      zeroToSixty: 3.8,
      topSpeed: 182,
      mileage: '18 City / 24 Hwy MPG',
      fuelCapacity: '16.9 Gallons',
      transmission: '8-Speed Dual-Clutch (PDK)',
      drivetrain: 'Rear-Wheel Drive (RWD)',
      seating: 4,
      engine: '3.0L Twin-Turbo Flat-6',
      curbWeight: '3,354 lbs',
    },
    {
      make: 'BMW',
      model: 'M4 Competition',
      category: 'Coupe',
      year: 2024,
      price: 82200,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
      bhp: 503,
      zeroToSixty: 3.4,
      topSpeed: 180,
      mileage: '16 City / 23 Hwy MPG',
      fuelCapacity: '15.6 Gallons',
      transmission: '8-Speed M Steptronic Automatic',
      drivetrain: 'Rear-Wheel Drive (RWD)',
      seating: 4,
      engine: '3.0L Twin-Power Turbo Inline-6',
      curbWeight: '3,880 lbs',
    },
    {
      make: 'Tesla',
      model: 'Model 3 Performance',
      category: 'Electric',
      year: 2024,
      price: 52990,
      quantity: 4,
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
      bhp: 510,
      zeroToSixty: 2.9,
      topSpeed: 163,
      mileage: '303 Miles Electric Range',
      fuelCapacity: '82 kWh Lithium-Ion',
      transmission: 'Single-Speed Fixed Gear',
      drivetrain: 'Dual-Motor All-Wheel Drive (AWD)',
      seating: 5,
      engine: 'Dual Permanent Magnet Electric Motors',
      curbWeight: '4,054 lbs',
    },
    {
      make: 'Rivian',
      model: 'R1S Adventure',
      category: 'SUV',
      year: 2024,
      price: 78000,
      quantity: 0, // Out of stock to demonstrate disabled state
      imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      bhp: 835,
      zeroToSixty: 3.0,
      topSpeed: 115,
      mileage: '321 Miles Range (Large Pack)',
      fuelCapacity: '135 kWh Battery Pack',
      transmission: 'Quad-Motor Direct Drive',
      drivetrain: 'Independent Quad-Motor AWD',
      seating: 7,
      engine: 'Quad AC Permanent Magnet Motors',
      curbWeight: '7,068 lbs',
    },
    {
      make: 'Ford',
      model: 'F-150 Lightning',
      category: 'Truck',
      year: 2023,
      price: 62000,
      quantity: 3,
      imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
      bhp: 580,
      zeroToSixty: 4.0,
      topSpeed: 110,
      mileage: '320 Miles Extended Range',
      fuelCapacity: '131 kWh Extended Battery',
      transmission: 'Single-Speed Automatic',
      drivetrain: 'Dual-Motor 4x4 AWD',
      seating: 5,
      engine: 'Dual Electric Inboard Motors',
      curbWeight: '6,590 lbs',
    },
    {
      make: 'Toyota',
      model: 'RAV4 Hybrid',
      category: 'SUV',
      year: 2024,
      price: 34500,
      quantity: 8,
      imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
      bhp: 219,
      zeroToSixty: 7.3,
      topSpeed: 118,
      mileage: '41 City / 38 Hwy MPG',
      fuelCapacity: '14.5 Gallons',
      transmission: 'Electronically Controlled CVT (eCVT)',
      drivetrain: 'Electronic On-Demand AWD',
      seating: 5,
      engine: '2.5L 4-Cylinder Hybrid Synergy Drive',
      curbWeight: '3,755 lbs',
    },
    {
      make: 'Honda',
      model: 'Civic Sport',
      category: 'Sedan',
      year: 2023,
      price: 26500,
      quantity: 10,
      imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
      bhp: 180,
      zeroToSixty: 7.4,
      topSpeed: 137,
      mileage: '31 City / 38 Hwy MPG',
      fuelCapacity: '12.4 Gallons',
      transmission: 'Continuously Variable (M-CVT)',
      drivetrain: 'Front-Wheel Drive (FWD)',
      seating: 5,
      engine: '1.5L Turbo In-Line 4-Cylinder',
      curbWeight: '3,050 lbs',
    },
    {
      make: 'Volkswagen',
      model: 'ID. Buzz',
      category: 'Van',
      year: 2024,
      price: 59995,
      quantity: 5,
      imageUrl: 'https://images.unsplash.com/photo-1760044275059-c837e2a3a5da?auto=format&fit=crop&w=800&q=80',
      bhp: 282,
      zeroToSixty: 7.9,
      topSpeed: 99,
      mileage: '260 Miles Electric Range',
      fuelCapacity: '91 kWh Lithium-Ion',
      transmission: 'Single-Speed Automatic',
      drivetrain: 'Rear-Wheel Drive (RWD)',
      seating: 7,
      engine: 'Rear-Mounted Electric Motor (APP550)',
      curbWeight: '5,400 lbs',
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
