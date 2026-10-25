import { PrismaClient } from '@prisma/client';
import { CreateVehicleBody, UpdateVehicleBody, VehicleSearchQuery, RestockBody } from '../types';

/**
 * Vehicle service: handles all vehicle and inventory business logic.
 */
export class VehicleService {
  constructor(private prisma: PrismaClient) {}

  /** Returns all vehicles in the inventory. */
  async getAll() {
    return this.prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
  }

  /** Searches vehicles by optional filters: make, model, category, price range. */
  async search(query: VehicleSearchQuery) {
    const { make, model, category, minPrice, maxPrice } = query;

    const min =
      minPrice !== undefined && minPrice !== null && minPrice !== ''
        ? typeof minPrice === 'number'
          ? minPrice
          : parseFloat(minPrice)
        : undefined;

    const max =
      maxPrice !== undefined && maxPrice !== null && maxPrice !== ''
        ? typeof maxPrice === 'number'
          ? maxPrice
          : parseFloat(maxPrice)
        : undefined;

    return this.prisma.vehicle.findMany({
      where: {
        ...(make && { make: { contains: make } }),
        ...(model && { model: { contains: model } }),
        ...(category && { category: { contains: category } }),
        ...(min !== undefined || max !== undefined
          ? {
              price: {
                ...(min !== undefined && { gte: min }),
                ...(max !== undefined && { lte: max }),
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Finds a single vehicle by ID. Returns null if not found. */
  async getById(id: string) {
    return this.prisma.vehicle.findUnique({ where: { id } });
  }

  /** Creates a new vehicle entry. */
  async create(data: CreateVehicleBody) {
    return this.prisma.vehicle.create({ data });
  }

  /** Updates a vehicle by ID. Returns null if not found. */
  async update(id: string, data: UpdateVehicleBody) {
    const vehicle = await this.getById(id);
    if (!vehicle) return null;

    return this.prisma.vehicle.update({ where: { id }, data });
  }

  /** Deletes a vehicle by ID. Returns null if not found. */
  async delete(id: string) {
    const vehicle = await this.getById(id);
    if (!vehicle) return null;

    return this.prisma.vehicle.delete({ where: { id } });
  }

  /**
   * Purchases (decrements quantity by 1) for a vehicle atomically.
   * Decrements only when quantity is greater than zero to prevent race conditions.
   * @throws Error('OUT_OF_STOCK') if quantity is 0
   * @throws Error('NOT_FOUND') if vehicle not found
   */
  async purchase(id: string) {
    // Atomic conditional decrement: only decrement if quantity > 0
    const result = await this.prisma.vehicle.updateMany({
      where: {
        id,
        quantity: { gt: 0 },
      },
      data: {
        quantity: { decrement: 1 },
      },
    });

    if (result.count === 0) {
      const vehicle = await this.getById(id);
      if (!vehicle) throw new Error('NOT_FOUND');
      throw new Error('OUT_OF_STOCK');
    }

    return this.getById(id);
  }

  /**
   * Restocks (increments quantity) for a vehicle.
   * @throws Error('NOT_FOUND') if vehicle not found
   */
  async restock(id: string, data: RestockBody) {
    const vehicle = await this.getById(id);
    if (!vehicle) throw new Error('NOT_FOUND');

    return this.prisma.vehicle.update({
      where: { id },
      data: { quantity: { increment: data.quantity } },
    });
  }
}
