import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';

/**
 * Creates auth router with injected PrismaClient (supports test isolation).
 */
export function createAuthRouter(prisma: PrismaClient) {
  const router = Router();
  const authService = new AuthService(prisma);
  const authController = new AuthController(authService);

  /** POST /api/auth/register — Create a new user account */
  router.post('/register', authController.register);

  /** POST /api/auth/login — Authenticate and receive a JWT */
  router.post('/login', authController.login);

  return router;
}
