import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Initializes and migrates the SQLite test database (test.db) before running automated tests.
 * Cleans any stale test database and applies all migrations using `prisma migrate deploy`,
 * verifying migration reproducibility and completely isolating tests from development data (dev.db).
 */
export function setupTestDb(): void {
  const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
  const testDbFile = path.resolve(__dirname, '../prisma/test.db');
  const testDbUrl = 'file:./test.db';

  if (fs.existsSync(testDbFile)) {
    try {
      fs.unlinkSync(testDbFile);
    } catch {}
  }
  const journal = `${testDbFile}-journal`;
  if (fs.existsSync(journal)) {
    try {
      fs.unlinkSync(journal);
    } catch {}
  }

  execSync(`npx prisma migrate deploy --schema="${schemaPath}"`, {
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
