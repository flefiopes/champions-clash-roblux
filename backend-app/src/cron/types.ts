/**
 * Cron job types and interfaces.
 *
 * @module cron/types
 */

import { Job } from 'bullmq';

/**
 * Cron job definition interface.
 * Each cron job must define a name, schedule, and handler.
 */
export interface CronJobDefinition {
  /** Unique identifier for the cron job (used as BullMQ job name) */
  name: string;
  /** Cron expression scheduling the job **/
  cron: string;
  /** Function to execute when the cron job triggers */
  handler: (job: Job) => Promise<void>;
}
