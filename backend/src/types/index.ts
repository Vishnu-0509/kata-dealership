import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export interface RegisterBody {
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface CreateVehicleBody {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  exhaustAudioUrl?: string | null;
  year?: number | null;
  bhp?: number | null;
  zeroToSixty?: number | null;
  topSpeed?: number | null;
  mileage?: string | null;
  fuelCapacity?: string | null;
  transmission?: string | null;
  drivetrain?: string | null;
  seating?: number | null;
  engine?: string | null;
  curbWeight?: string | null;
}

export interface UpdateVehicleBody {
  make?: string;
  model?: string;
  category?: string;
  price?: number;
  quantity?: number;
  imageUrl?: string | null;
  exhaustAudioUrl?: string | null;
  year?: number | null;
  bhp?: number | null;
  zeroToSixty?: number | null;
  topSpeed?: number | null;
  mileage?: string | null;
  fuelCapacity?: string | null;
  transmission?: string | null;
  drivetrain?: string | null;
  seating?: number | null;
  engine?: string | null;
  curbWeight?: string | null;
}

export interface VehicleSearchQuery {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
}

export interface RestockBody {
  quantity: number;
}
