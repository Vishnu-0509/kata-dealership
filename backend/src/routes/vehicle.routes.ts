import { Router } from 'express';
import {
  getAllVehicles,
  searchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
} from '../controllers/vehicle.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// All vehicle routes require authentication
router.use(authenticate);

/** GET /api/vehicles — List all vehicles */
router.get('/', getAllVehicles);

/** GET /api/vehicles/search — Search vehicles by query params */
router.get('/search', searchVehicles);

/** POST /api/vehicles — Add a new vehicle (Admin only) */
router.post('/', requireAdmin, createVehicle);

/** PUT /api/vehicles/:id — Update a vehicle (Admin only) */
router.put('/:id', requireAdmin, updateVehicle);

/** DELETE /api/vehicles/:id — Delete a vehicle (Admin only) */
router.delete('/:id', requireAdmin, deleteVehicle);

/** POST /api/vehicles/:id/purchase — Purchase a vehicle */
router.post('/:id/purchase', purchaseVehicle);

/** POST /api/vehicles/:id/restock — Restock a vehicle (Admin only) */
router.post('/:id/restock', requireAdmin, restockVehicle);

export default router;
