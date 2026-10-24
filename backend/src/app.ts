import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';

/**
 * Creates and configures the Express application.
 * Exported separately from server startup to allow supertest to import it.
 */
export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/vehicles', vehicleRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  return app;
}

export default createApp();
