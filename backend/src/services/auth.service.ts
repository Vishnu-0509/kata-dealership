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
   * @throws Error if email or username already exists
   */
  async register(data: RegisterBody) {
    const email = data.email.trim().toLowerCase();
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new Error('EMAIL_EXISTS');
    }

    const username = data.username ? data.username.trim().toLowerCase() : null;
    if (username) {
      const existingUsername = await this.prisma.user.findFirst({
        where: { username },
      });
      if (existingUsername) {
        throw new Error('USERNAME_EXISTS');
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: 'USER',
      },
      select: { id: true, email: true, username: true, role: true, createdAt: true },
    });

    return user;
  }

  /**
   * Logs in a user by username or email and returns a signed JWT.
   * @throws Error if credentials are invalid
   */
  async login(data: LoginBody) {
    const identifier = (data.usernameOrEmail || data.email || '').trim().toLowerCase();
    if (!identifier) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username, role: user.role },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    return {
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    };
  }
}
