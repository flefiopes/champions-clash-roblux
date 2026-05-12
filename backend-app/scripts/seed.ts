/**
 * Database seed script.
 * Can be used to inject initial game configuration, default products,
 * or mock data into the database for local development.
 */

import { getDatabase, initDatabase, closeDatabase } from '@/db';
import { getLogger } from '@/lib/logger';
import { gameConfig } from '@/db/schema';

const logger = getLogger();

async function runSeed() {
  logger.info('Starting database seed...');
  await initDatabase();
  const db = getDatabase();

  // Insert default game config if not present
  await db
    .insert(gameConfig)
    .values({
      key: 'global_multiplier',
      value: 1.0,
      updatedBy: 'seed',
    })
    .onDuplicateKeyUpdate({ set: { value: 1.0 } });

  logger.info('Database seed completed successfully.');
  await closeDatabase();
}

runSeed().catch((error) => {
  logger.error({ error }, 'Database seed failed');
  process.exit(1);
});
