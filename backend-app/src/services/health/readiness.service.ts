/**
 * Readiness service module.
 * Provides health checks for all service dependencies.
 *
 * @module services/health/readiness
 */

import { sql } from 'drizzle-orm';
import { getDatabase } from '@/db';
import { getRedisClient } from '@/lib/redis';
import { loggers } from '@/lib/logger';

/** Readiness service logger */
const logger = loggers.db();

/**
 * Service status type.
 */
export type ServiceStatus = 'ok' | 'error';

/**
 * Individual service check result.
 */
export interface ServiceCheck {
  status: ServiceStatus;
  latencyMs?: number;
  error?: string;
}

/**
 * Complete readiness check result.
 */
export interface ReadinessResult {
  healthy: boolean;
  checks: {
    mysql: ServiceCheck;
    redis: ServiceCheck;
  };
}

/**
 * Checks MySQL database connectivity.
 *
 * @returns Service check result
 */
async function checkMysql(): Promise<ServiceCheck> {
  const start = Date.now();

  try {
    const db = getDatabase();
    await db.execute(sql`SELECT 1`);

    return {
      status: 'ok',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    logger.error({ error }, 'MySQL health check failed');

    return {
      status: 'error',
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Checks Redis connectivity.
 *
 * @returns Service check result
 */
async function checkRedis(): Promise<ServiceCheck> {
  const start = Date.now();

  try {
    const redis = getRedisClient();
    await redis.ping();

    return {
      status: 'ok',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    logger.error({ error }, 'Redis health check failed');

    return {
      status: 'error',
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Performs a complete readiness check on all services.
 *
 * @returns Readiness result with individual service statuses
 */
export async function checkReadiness(): Promise<ReadinessResult> {
  // Run all checks in parallel for efficiency
  const [mysql, redis] = await Promise.all([checkMysql(), checkRedis()]);

  const healthy = mysql.status === 'ok' && redis.status === 'ok';

  return {
    healthy,
    checks: { mysql, redis },
  };
}
