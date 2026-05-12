/**
 * Cron job registry.
 * Exports all available cron jobs for registration by the cron worker.
 *
 * @module cron/index
 */

import type { CronJobDefinition } from './types';
import { heartbeatJob } from './jobs/heartbeat.job';

export type { CronJobDefinition } from './types';

/**
 * List of all active cron jobs.
 * Add new jobs to this array to register them automatically.
 */
export const cronJobs: CronJobDefinition[] = [heartbeatJob];
