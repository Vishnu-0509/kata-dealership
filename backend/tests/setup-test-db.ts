import { execSync } from 'child_process';
import path from 'path';

/**
 * Initializes and migrates the SQLite test database (test.db) before running automated tests.
 * Ensures tests run on an isolated database without mutating development data (dev.db).
 */
export function setupTestDb(): void {
  const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
  const testDbUrl = 'file:./test.db';

  execSync(`npx prisma db push --schema="${schemaPath}" --skip-generate --accept-data-loss`, {
    env: {
      ...process.env,
      DATABASE_URL: testDbUrl,
      NODE_ENV: 'test',
    },
    stdio: 'inherit',
  });
}

if (require.main === module) {
  setupTestDb();
}
