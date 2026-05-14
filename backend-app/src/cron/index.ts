/**
 * Cron job registry.
 * Exports all active cron job definitions for registration by the cron worker.
 * Add new jobs to the cronJobs array to have them registered automatically.
 *
 * @module cron/index
 */

import type { CronJobDefinition } from './types';
import { weeklyWarResetJob } from './jobs/weekly-war-reset.job';
import { expireBoostsJob } from './jobs/expire-boosts.job';
import { questCleanupJob } from './jobs/quest-cleanup.job';

export type { CronJobDefinition } from './types';

/**
 * List of all active cron jobs.
 * The cron worker iterates this array on startup to register BullMQ repeatable jobs.
 */
export const cronJobs: CronJobDefinition[] = [weeklyWarResetJob, expireBoostsJob, questCleanupJob];
