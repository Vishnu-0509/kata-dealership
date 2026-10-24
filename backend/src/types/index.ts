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
}

export interface UpdateVehicleBody {
  make?: string;
  model?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export interface VehicleSearchQuery {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}

export interface RestockBody {
  quantity: number;
}
