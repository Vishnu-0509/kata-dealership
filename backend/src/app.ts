import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createAuthRouter } from './routes/auth.routes';
import { createVehicleRouter } from './routes/vehicle.routes';

/**
 * Creates and configures the Express application.
 * Accepts an optional PrismaClient instance to support test injection.
 */
export function createApp(prisma?: PrismaClient) {
  const db = prisma || new PrismaClient();
  const app = express();

  // Middleware
  app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes — pass db so controllers use the injected client
  app.use('/api/auth', createAuthRouter(db));
  app.use('/api/vehicles', createVehicleRouter(db));

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  return app;
}

export default createApp();
