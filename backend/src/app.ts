import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
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
  app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes — pass db so controllers use the injected client
  app.use('/api/auth', createAuthRouter(db));
  app.use('/api/vehicles', createVehicleRouter(db));

  // Serve compiled React frontend in production if dist directory exists
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  // 404 handler for API routes
  app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  return app;
}

export default createApp();
