/**
 * Quest cleanup cron job.
 * Runs nightly to remove old claimed quests and expired assignments.
 *
 * @module cron/jobs/quest-cleanup
 */

import { createChildLogger } from '@/lib/logger';
import { cleanupPastQuests } from '@/services/quest/quest.service';
import type { CronJobDefinition } from '../types';

const logger = createChildLogger({ module: 'quest-cleanup-job' });

/**
 * Quest cleanup job definition.
 * Scheduled for 03:00 AM every night.
 */
export const questCleanupJob: CronJobDefinition = {
  name: 'quest-cleanup',
  // 03:00 every day
  cron: '0 3 * * *',
  handler: async () => {
    logger.info('Starting nightly quest cleanup...');
    try {
      await cleanupPastQuests();
      logger.info('Quest cleanup finished successfully.');
    } catch (error) {
      logger.error({ error }, 'Quest cleanup failed');
      throw error;
    }
  },
};
