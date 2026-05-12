/**
 * Boost expiry cron job.
 * Runs every 5 minutes.
 * Deletes active_boost rows whose expires_at timestamp is in the past,
 * keeping the table lean and ensuring expired multipliers are no longer served to clients.
 *
 * @module cron/jobs/expire-boosts
 */

import { lt } from 'drizzle-orm';
import { getDatabase } from '@/db';
import { activeBoosts } from '@/db/schema';
import { createChildLogger } from '@/lib/logger';
import type { CronJobDefinition } from '../types';

/** Cron job logger */
const logger = createChildLogger({ module: 'cron/expire-boosts' });

/**
 * Deletes all expired boost rows from the active_boosts table.
 * Uses a single DELETE WHERE expires_at < NOW() for efficiency.
 */
async function runExpireBoosts(): Promise<void> {
  const db = getDatabase();
  const now = new Date();

  const result = await db.delete(activeBoosts).where(lt(activeBoosts.expiresAt, now));

  // Drizzle mysql2 returns the ResultSetHeader; rowsAffected is in [0].affectedRows
  const affected = Array.isArray(result)
    ? ((result[0] as { affectedRows?: number }).affectedRows ?? 0)
    : 0;

  if (affected > 0) {
    logger.info({ deleted: affected }, 'Expired boosts purged');
  } else {
    logger.debug('No expired boosts to purge');
  }
}

/**
 * Cron job definition — runs every 5 minutes.
 */
export const expireBoostsJob: CronJobDefinition = {
  name: 'expire-boosts',
  cron: '*/5 * * * *',
  handler: runExpireBoosts,
};
