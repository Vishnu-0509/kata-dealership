import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-z0-9_-]+$/, 'Username must contain only letters, numbers, underscores or hyphens')
    .optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z
  .object({
    usernameOrEmail: z.string().trim().optional(),
    email: z.string().trim().optional(),
    username: z.string().trim().optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine((data) => Boolean(data.usernameOrEmail || data.email || data.username), {
    message: 'Username or email is required',
    path: ['usernameOrEmail'],
  });

/**
 * AuthController handles HTTP requests for user authentication.
 */
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/auth/register
   * Registers a new user account.
   */
  register = async (req: Request, res: Response): Promise<void> => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    try {
      const user = await this.authService.register(parsed.data);
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === 'EMAIL_EXISTS') {
          res.status(409).json({ message: 'Email already in use' });
          return;
        }
        if (err.message === 'USERNAME_EXISTS') {
          res.status(409).json({ message: 'Username already in use' });
          return;
        }
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  /**
   * POST /api/auth/login
   * Authenticates a user and returns a JWT.
   */
  login = async (req: Request, res: Response): Promise<void> => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const identifier = (parsed.data.usernameOrEmail || parsed.data.email || parsed.data.username || '').trim().toLowerCase();

    try {
      const result = await this.authService.login({
        usernameOrEmail: identifier,
        password: parsed.data.password,
      });
      res.status(200).json({ message: 'Login successful', ...result });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({ message: 'Invalid credentials. Please verify your username/email and password.' });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}
