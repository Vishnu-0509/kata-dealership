import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterBody, LoginBody } from '../types';
import { getJwtSecret } from '../config/env';

const SALT_ROUNDS = 10;

/**
 * Auth service: handles user registration and login business logic.
 */
export class AuthService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Registers a new user.
   * @throws Error if email already exists
   */
  async register(data: RegisterBody) {
    const email = data.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new Error('EMAIL_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'USER',
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return user;
  }

  /**
   * Logs in a user and returns a signed JWT.
   * @throws Error if credentials are invalid
   */
  async login(data: LoginBody) {
    const email = data.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    return {
      token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
