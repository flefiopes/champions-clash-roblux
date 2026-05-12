/**
 * Heartbeat cron job.
 * Logs a heartbeat message to verify cron system is operational.
 * Runs every 5 minutes by default.
 *
 * @module cron/jobs/heartbeat
 */

import type { CronJobDefinition } from '../types';
import { createChildLogger } from '@/lib/logger';

/** Heartbeat job logger */
const logger = createChildLogger({ module: 'cron:heartbeat' });

/**
 * Heartbeat cron job definition.
 * Logs system status every 5 minutes.
 */
export const heartbeatJob: CronJobDefinition = {
  name: 'heartbeat',
  cron: '*/5 * * * *',
  handler: async () => {
    const memoryUsage = process.memoryUsage();
    const uptimeSeconds = process.uptime();

    logger.info(
      {
        uptime: `${Math.floor(uptimeSeconds / 60)}m ${Math.floor(uptimeSeconds % 60)}s`,
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
      },
      'Heartbeat — system alive'
    );
  },
};
