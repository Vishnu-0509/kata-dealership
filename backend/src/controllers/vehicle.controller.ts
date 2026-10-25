import { Request, Response } from 'express';
import { z } from 'zod';
import { VehicleService } from '../services/vehicle.service';

const createVehicleSchema = z.object({
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  category: z.string().trim().min(1, 'Category is required'),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')).nullable(),
  exhaustAudioUrl: z.string().url('Invalid audio URL').optional().or(z.literal('')).nullable(),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  bhp: z.number().int().positive().optional().nullable(),
  zeroToSixty: z.number().positive().optional().nullable(),
  topSpeed: z.number().int().positive().optional().nullable(),
  mileage: z.string().optional().nullable(),
  fuelCapacity: z.string().optional().nullable(),
  transmission: z.string().optional().nullable(),
  drivetrain: z.string().optional().nullable(),
  seating: z.number().int().positive().optional().nullable(),
  engine: z.string().optional().nullable(),
  curbWeight: z.string().optional().nullable(),
});

const updateVehicleSchema = createVehicleSchema.partial();

const searchVehicleSchema = z
  .object({
    make: z.string({ invalid_type_error: 'Make must be a string' }).trim().min(1).optional(),
    model: z.string({ invalid_type_error: 'Model must be a string' }).trim().min(1).optional(),
    category: z.string({ invalid_type_error: 'Category must be a string' }).trim().min(1).optional(),
    minPrice: z
      .string({ invalid_type_error: 'minPrice must be a string' })
      .regex(/^\d+(\.\d+)?$/, 'minPrice must be a valid non-negative number')
      .transform((val) => Number(val))
      .optional(),
    maxPrice: z
      .string({ invalid_type_error: 'maxPrice must be a string' })
      .regex(/^\d+(\.\d+)?$/, 'maxPrice must be a valid non-negative number')
      .transform((val) => Number(val))
      .optional(),
  })
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: 'minPrice cannot exceed maxPrice',
      path: ['minPrice'],
    }
  );

const restockSchema = z.object({
  quantity: z.number().int().positive('Quantity to restock must be positive'),
});

/**
 * VehicleController handles HTTP requests for vehicles and inventory.
 */
export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  /**
   * GET /api/vehicles
   * Returns all vehicles.
   */
  getAllVehicles = async (_req: Request, res: Response): Promise<void> => {
    try {
      const vehicles = await this.vehicleService.getAll();
      res.status(200).json(vehicles);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  /**
   * GET /api/vehicles/search
   * Searches vehicles by make, model, category, minPrice, maxPrice query params.
   * Validates input bounds, numbers, and types before querying.
   */
  searchVehicles = async (req: Request, res: Response): Promise<void> => {
    const parsed = searchVehicleSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        message: 'Validation error',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const vehicles = await this.vehicleService.search(parsed.data);
      res.status(200).json(vehicles);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  /**
   * POST /api/vehicles
   * Creates a new vehicle (Admin only).
   */
  createVehicle = async (req: Request, res: Response): Promise<void> => {
    const parsed = createVehicleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    try {
      const vehicle = await this.vehicleService.create(parsed.data);
      res.status(201).json(vehicle);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  /**
   * PUT /api/vehicles/:id
   * Updates a vehicle by ID (Admin only).
   */
  updateVehicle = async (req: Request, res: Response): Promise<void> => {
    const parsed = updateVehicleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    try {
      const vehicle = await this.vehicleService.update(req.params.id, parsed.data);
      if (!vehicle) {
        res.status(404).json({ message: 'Vehicle not found' });
        return;
      }
      res.status(200).json(vehicle);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  /**
   * DELETE /api/vehicles/:id
   * Deletes a vehicle by ID (Admin only).
   */
  deleteVehicle = async (req: Request, res: Response): Promise<void> => {
    try {
      const vehicle = await this.vehicleService.delete(req.params.id);
      if (!vehicle) {
        res.status(404).json({ message: 'Vehicle not found' });
        return;
      }
      res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  /**
   * POST /api/vehicles/:id/purchase
   * Purchases a vehicle, decrementing its quantity by 1.
   */
  purchaseVehicle = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.role === 'DEMO') {
      res.status(403).json({
        message: 'Demo mode is view-only. Please log in or register a customer account to purchase vehicles.',
      });
      return;
    }

    try {
      const vehicle = await this.vehicleService.purchase(req.params.id);
      res.status(200).json({ message: 'Vehicle purchased successfully', vehicle });
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === 'NOT_FOUND') {
          res.status(404).json({ message: 'Vehicle not found' });
          return;
        }
        if (err.message === 'OUT_OF_STOCK') {
          res.status(400).json({ message: 'Vehicle is out of stock' });
          return;
        }
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  /**
   * POST /api/vehicles/:id/restock
   * Restocks a vehicle, increasing its quantity (Admin only).
   */
  restockVehicle = async (req: Request, res: Response): Promise<void> => {
    const parsed = restockSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    try {
      const vehicle = await this.vehicleService.restock(req.params.id, parsed.data);
      res.status(200).json({ message: 'Vehicle restocked successfully', vehicle });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'NOT_FOUND') {
        res.status(404).json({ message: 'Vehicle not found' });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}
