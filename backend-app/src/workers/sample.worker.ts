/**
 * Sample worker — demonstrates a basic BullMQ worker pattern.
 * Processes jobs from the "sample" queue with configurable concurrency.
 *
 * @module workers/sample
 */

import { createWorker, getQueue, QUEUE_NAMES, type SampleJobData } from '@/lib/queue';
import { getEnvConfig } from '@/config';
import { createChildLogger } from '@/lib/logger';

/** Sample worker logger */
const logger = createChildLogger({ module: 'sample-worker' });

/**
 * Queues a sample job.
 *
 * @param message - Message string to process
 * @returns Job instance
 */
export async function queueSampleJob(message: string) {
  const queue = getQueue<SampleJobData>(QUEUE_NAMES.SAMPLE);

  const job = await queue.add('process-sample', {
    message,
    timestamp: Date.now(),
  });

  logger.info({ jobId: job.id, message }, 'Sample job queued');
  return job;
}

/**
 * Starts the sample worker.
 * Demonstrates the inline processor pattern.
 *
 * @returns Worker instance
 */
export function startSampleWorker() {
  const env = getEnvConfig();
  const concurrency = env.sampleWorker.concurrency;

  logger.info({ concurrency }, 'Starting sample worker');

  const worker = createWorker<SampleJobData>(
    QUEUE_NAMES.SAMPLE,
    async (job) => {
      logger.info({ jobId: job.id, data: job.data }, 'Processing sample job');

      // Simulate some work
      await new Promise((resolve) => setTimeout(resolve, 100));

      logger.info({ jobId: job.id }, 'Sample job processed successfully');
    },
    concurrency
  );

  return worker;
}
