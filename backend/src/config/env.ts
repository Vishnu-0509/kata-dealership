import dotenv from 'dotenv';
import path from 'path';

// Load environment variables immediately
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

export interface AppConfig {
  jwtSecret: string;
  port: number;
  databaseUrl: string;
  frontendUrl: string;
  nodeEnv: string;
}

/**
 * Validates raw environment dictionary and returns strongly typed configuration.
 * Fails fast with a clear error message if critical variables like JWT_SECRET are missing.
 */
export function validateEnv(env: Record<string, string | undefined> = process.env): AppConfig {
  const jwtSecret = env.JWT_SECRET?.trim();
  if (!jwtSecret) {
    throw new Error(
      'FATAL: JWT_SECRET environment variable is required and missing. Application cannot start securely without a valid secret key.'
    );
  }

  const port = env.PORT ? parseInt(env.PORT, 10) : 3001;
  const databaseUrl = env.DATABASE_URL || 'file:./dev.db';
  const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173';
  const nodeEnv = env.NODE_ENV || 'development';

  return {
    jwtSecret,
    port,
    databaseUrl,
    frontendUrl,
    nodeEnv,
  };
}

/**
 * Returns the current validated JWT secret.
 * Always resolves dynamically so test overrides are supported without hardcoded fallbacks.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET is missing. Cannot sign or verify authentication tokens.');
  }
  return secret;
}

// Default validated config for runtime
export const config: AppConfig = {
  get jwtSecret() {
    return getJwtSecret();
  },
  get port() {
    return process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  },
  get databaseUrl() {
    return process.env.DATABASE_URL || 'file:./dev.db';
  },
  get frontendUrl() {
    return process.env.FRONTEND_URL || 'http://localhost:5173';
  },
  get nodeEnv() {
    return process.env.NODE_ENV || 'development';
  },
};
