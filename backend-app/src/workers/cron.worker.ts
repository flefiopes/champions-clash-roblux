/**
 * Cron worker.
 * Handles scheduling and execution of cron jobs via BullMQ repeatable jobs.
 * Automatically registers, updates, and cleans up cron jobs on startup.
 *
 * @module workers/cron
 */

import { createWorker, getQueue, QUEUE_NAMES } from '@/lib/queue';
import { getEnvConfig } from '@/config';
import { createChildLogger } from '@/lib/logger';
import { cronJobs } from '@/cron';

/** Worker logger */
const logger = createChildLogger({ module: 'cron-worker' });

/**
 * Registers all defined cron jobs in the BullMQ queue.
 * Removes stale schedulers and ensures current definitions are up-to-date.
 */
async function registerCronJobs(): Promise<void> {
  const queue = getQueue(QUEUE_NAMES.CRON);
  const registeredJobs = new Set<string>();

  logger.info('Registering cron jobs...');

  for (const jobDef of cronJobs) {
    try {
      // Remove old schedulers with same name to update schedule
      const oldJobs = await queue.getJobSchedulers();
      for (const oldJob of oldJobs) {
        if (oldJob.name === jobDef.name) {
          await queue.removeJobScheduler(oldJob.key);
        }
      }

      await queue.add(
        jobDef.name,
        {},
        {
          repeat: { pattern: jobDef.cron },
          jobId: `cron-${jobDef.name}`,
        }
      );

      registeredJobs.add(jobDef.name);
      logger.info({ job: jobDef.name, schedule: jobDef.cron }, 'Registered cron job');
    } catch (error) {
      logger.error({ job: jobDef.name, error }, 'Failed to register cron job');
    }
  }

  // Remove obsolete schedulers no longer in code
  const allSchedulers = await queue.getJobSchedulers();
  for (const scheduler of allSchedulers) {
    if (!registeredJobs.has(scheduler.name)) {
      logger.info({ job: scheduler.name, key: scheduler.key }, 'Removing obsolete cron job');
      await queue.removeJobScheduler(scheduler.key);
    }
  }
}

/**
 * Initializes and starts the cron worker.
 * Call this during application startup.
 *
 * @returns Worker instance
 */
export function startCronWorker() {
  const env = getEnvConfig();
  const concurrency = env.cron.workerConcurrency;

  logger.info({ concurrency }, 'Starting cron worker');

  registerCronJobs().catch((err) => {
    logger.error({ err }, 'Failed to register cron jobs during startup');
  });

  const worker = createWorker(
    QUEUE_NAMES.CRON,
    async (job) => {
      const jobName = job.name;
      const jobDef = cronJobs.find((j) => j.name === jobName);

      if (!jobDef) {
        logger.warn({ jobId: job.id, jobName }, 'Unknown cron job triggered');
        return;
      }

      logger.info({ jobId: job.id, jobName }, 'Executing cron job');

      try {
        await jobDef.handler(job);
        logger.info({ jobId: job.id, jobName }, 'Cron job finished successfully');
      } catch (error) {
        logger.error({ jobId: job.id, jobName, error }, 'Cron job failed');
        throw error;
      }
    },
    concurrency
  );

  return worker;
}
