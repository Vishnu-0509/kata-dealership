import { setupTestDb } from './setup-test-db';

export default async function globalSetup(): Promise<void> {
  setupTestDb();
}
