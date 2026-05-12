/**
 * BullMQ queue factory module.
 * Provides job queue instances using existing Redis connection.
 *
 * @module lib/queue
 */

import { Queue, Worker, type Job, type Processor } from 'bullmq';
import { getRedisConfig, getEnvConfig } from '@/config';
import { createChildLogger } from '@/lib/logger';

/** Queue module logger */
const logger = createChildLogger({ module: 'queue' });

/**
 * Returns Redis connection options for BullMQ.
 *
 * @returns Redis connection configuration
 */
function getRedisConnection() {
  const config = getRedisConfig();
  return {
    host: config.host,
    port: config.port,
    password: config.password,
  };
}

/** Queue name constants */
export const QUEUE_NAMES = {
  CRON: 'cron',
  SAMPLE: 'sample',
} as const;

/** Sample job data interface */
export interface SampleJobData {
  message: string;
  timestamp: number;
}

/** Cached queue instances */
const queues = new Map<string, Queue>();

/**
 * Gets or creates a BullMQ queue instance.
 * Job defaults are configurable via JOB_* environment variables.
 *
 * @param name - Queue name
 * @returns Queue instance
 */
export function getQueue<T = unknown>(name: string): Queue<T> {
  const existing = queues.get(name);
  if (existing) {
    return existing as Queue<T>;
  }

  const env = getEnvConfig();
  logger.debug({ queue: name }, 'Creating queue');

  const queue = new Queue<T>(name, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: env.queue.maxAttempts,
      backoff: {
        type: 'exponential',
        delay: env.queue.backoffDelayMs,
      },
      removeOnComplete: env.queue.removeOnComplete,
      removeOnFail: env.queue.removeOnFail,
    },
  });

  queues.set(name, queue as Queue);
  return queue;
}

/**
 * Creates a BullMQ worker for processing jobs with automatic execution time logging.
 *
 * @param name - Queue name to listen on
 * @param processor - Job processor function or path to processor file (sandboxed)
 * @param concurrency - Number of concurrent jobs (default: 2)
 * @returns Worker instance
 */
export function createWorker<T>(
  name: string,
  processor: Processor<T> | string,
  concurrency: number = 2
): Worker<T> {
  const isSandboxed = typeof processor === 'string';

  logger.info({ queue: name, concurrency, sandboxed: isSandboxed }, 'Creating worker');

  const worker = new Worker<T>(name, processor, {
    connection: getRedisConnection(),
    concurrency,
    useWorkerThreads: isSandboxed,
  });

  worker.on('completed', (job: Job<T>) => {
    const durationMs = job.finishedOn && job.processedOn ? job.finishedOn - job.processedOn : 0;
    logger.info({ jobId: job.id, queue: name, durationMs }, `Job completed in ${durationMs}ms`);
  });

  worker.on('failed', (job: Job<T> | undefined, error: Error) => {
    const durationMs = job?.finishedOn && job?.processedOn ? job.finishedOn - job.processedOn : 0;
    logger.error(
      { jobId: job?.id, queue: name, durationMs, error: error.message },
      `Job failed after ${durationMs}ms`
    );
  });

  return worker;
}

/**
 * Closes all queue connections.
 * Should be called during graceful shutdown.
 */
export async function closeQueues(): Promise<void> {
  logger.info('Closing all queues');

  for (const [name, queue] of queues) {
    await queue.close();
    logger.debug({ queue: name }, 'Queue closed');
  }

  queues.clear();
}
