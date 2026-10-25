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

export const KNOWN_INSECURE_PLACEHOLDERS = new Set([
  'fallback-secret',
  'your-super-secret-jwt-key-change-in-production',
  'replace-with-your-generated-32-plus-char-secret',
  'kata-dealership-secure-jwt-secret-key-32chars',
  'test-jwt-secret-key',
  'secret',
  'jwt-secret',
  'changeme',
]);

/**
 * Validates raw environment dictionary and returns strongly typed configuration.
 * Fails fast with a clear error message if critical variables like JWT_SECRET are missing
 * or if a known example placeholder is configured.
 */
export function validateEnv(env: Record<string, string | undefined> = process.env): AppConfig {
  const jwtSecret = env.JWT_SECRET?.trim();
  if (!jwtSecret) {
    throw new Error(
      'FATAL: JWT_SECRET environment variable is required and missing. Application cannot start securely without a valid secret key.'
    );
  }

  if (
    KNOWN_INSECURE_PLACEHOLDERS.has(jwtSecret.toLowerCase()) ||
    jwtSecret.toLowerCase().includes('replace-with-your') ||
    jwtSecret.toLowerCase().includes('change-in-production')
  ) {
    throw new Error(
      'FATAL: JWT_SECRET must not use a known example placeholder or insecure default. Generate a strong cryptographically random secret with at least 32 characters.'
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
  if (KNOWN_INSECURE_PLACEHOLDERS.has(secret.toLowerCase())) {
    throw new Error('FATAL: JWT_SECRET cannot use an insecure example placeholder.');
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
