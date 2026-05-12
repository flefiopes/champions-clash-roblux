/**
 * Sample threaded processor.
 * This file runs in a separate worker thread when passed as a file path
 * to createWorker. Demonstrates the sandboxed/threaded worker pattern.
 *
 * This processor is isolated from the main process and cannot share
 * in-memory state. It communicates via BullMQ job data only.
 *
 * @module workers/processors/sample
 */

import type { Job } from 'bullmq';

/** Data shape expected by this processor */
interface SampleProcessorData {
  message: string;
  timestamp: number;
}

/**
 * Processes a sample job in a worker thread.
 * This function is the entry point for the threaded worker.
 *
 * @param job - BullMQ job with sample data
 */
export default async function processor(job: Job<SampleProcessorData>): Promise<void> {
  console.log(`[Threaded Processor] Processing job ${job.id}: ${job.data.message}`);

  // Simulate CPU-intensive work in a separate thread
  const startTime = Date.now();
  await new Promise((resolve) => setTimeout(resolve, 200));
  const duration = Date.now() - startTime;

  console.log(`[Threaded Processor] Job ${job.id} completed in ${duration}ms`);
}
