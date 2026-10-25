/**
 * Standard vehicle categories supported throughout the dealership inventory system.
 */
export const VEHICLE_CATEGORIES = [
  'Sedan',
  'SUV',
  'Coupe',
  'Hatchback',
  'Convertible',
  'Electric',
  'Truck',
  'Van',
] as const;

export type VehicleCategory = (typeof VEHICLE_CATEGORIES)[number];
