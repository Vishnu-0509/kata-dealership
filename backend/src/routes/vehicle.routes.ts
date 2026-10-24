import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { VehicleService } from '../services/vehicle.service';
import { VehicleController } from '../controllers/vehicle.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

/**
 * Creates vehicle router with injected PrismaClient (supports test isolation).
 */
export function createVehicleRouter(prisma: PrismaClient) {
  const router = Router();
  const vehicleService = new VehicleService(prisma);
  const vehicleController = new VehicleController(vehicleService);

  // All vehicle routes require authentication
  router.use(authenticate);

  /** GET /api/vehicles — List all vehicles */
  router.get('/', vehicleController.getAllVehicles);

  /** GET /api/vehicles/search — Search vehicles by query params */
  router.get('/search', vehicleController.searchVehicles);

  /** POST /api/vehicles — Add a new vehicle (Admin only) */
  router.post('/', requireAdmin, vehicleController.createVehicle);

  /** PUT /api/vehicles/:id — Update a vehicle (Admin only) */
  router.put('/:id', requireAdmin, vehicleController.updateVehicle);

  /** DELETE /api/vehicles/:id — Delete a vehicle (Admin only) */
  router.delete('/:id', requireAdmin, vehicleController.deleteVehicle);

  /** POST /api/vehicles/:id/purchase — Purchase a vehicle */
  router.post('/:id/purchase', vehicleController.purchaseVehicle);

  /** POST /api/vehicles/:id/restock — Restock a vehicle (Admin only) */
  router.post('/:id/restock', requireAdmin, vehicleController.restockVehicle);

  return router;
}
