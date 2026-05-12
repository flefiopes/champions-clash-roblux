/**
 * Champions Clash API — Application Entry Point.
 * Initializes ElysiaJS server with all middleware, security, and routes.
 * Provides graceful shutdown handling for all connections.
 * Supports multi-CPU scaling via Node.js clustering.
 *
 * @module index
 */

import cluster from 'node:cluster';
import os from 'node:os';
import process from 'node:process';
import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { helmet } from 'elysia-helmet';
import { ip } from 'elysia-ip';
import { ZodError } from 'zod/v4';
import { randomUUID } from 'node:crypto';
import { getEnvConfig } from '@/config';
import { getLogger, createChildLogger } from '@/lib/logger';
import { closeRedis } from '@/lib/redis';
import { closeQueues } from '@/lib/queue';
import { initDatabase, closeDatabase } from '@/db';
import { apiRoutes } from '@/routes';
import { startCronWorker } from '@/workers';
import { AppError } from '@/lib/app-error';
import console from 'node:console';
import { formatErrorResponse } from './lib/response-helpers';

/** Main application logger */
const logger = createChildLogger({ module: 'app' });

/**
 * Creates and configures the Elysia application instance.
 * Sets up security headers, CORS, request tracking, logging, and error handling.
 *
 * @returns Configured Elysia application instance
 */
export function createApp() {
  const env = getEnvConfig();

  const app = new Elysia()
    /**
     * Swagger API Documentation
     */
    .use(
      swagger({
        path: '/api/swagger',
        documentation: {
          info: {
            title: 'Champions Clash API',
            version: '1.0.0',
            description: 'Backend API for Champions Clash 2027 — competitive Roblox faction game',
          },
        },
      })
    )

    /**
     * CORS configuration.
     */
    .use(
      cors({
        origin: env.corsOrigin,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      })
    )

    /**
     * Security headers via Helmet.
     */
    .use(
      helmet({
        contentSecurityPolicy: env.nodeEnv === 'production',
      })
    )

    /**
     * Client IP extraction.
     */
    .use(ip())

    /**
     * Request ID enrichment.
     * Uses existing X-Request-ID header if present, otherwise generates a new UUID.
     */
    .derive(({ request }) => {
      const requestId = request.headers.get('x-request-id') || randomUUID();
      return { requestId };
    })

    /**
     * Request logging middleware.
     */
    .onBeforeHandle(({ request, requestId }) => {
      const url = new URL(request.url);
      logger.debug({ method: request.method, path: url.pathname, requestId }, 'Incoming request');
    })

    .onAfterResponse(({ request, set, requestId, ip }) => {
      const url = new URL(request.url);
      logger.info(
        {
          method: request.method,
          path: url.pathname,
          status: set.status,
          requestId,
          ip,
        },
        'Request completed'
      );
    })

    /**
     * Global error handler.
     * Catches unhandled errors and returns consistent error responses.
     */
    .onError(({ code, error, set }) => {
      // Handle 404 Not Found explicitly
      if (code === 'NOT_FOUND') {
        set.status = 404;
        return formatErrorResponse('NOT_FOUND', 'Resource not found');
      }

      // Zod validation errors
      if (error instanceof ZodError) {
        set.status = 400;
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: error.issues,
          },
        };
      }

      // Application errors with known status codes
      if (error instanceof AppError) {
        set.status = error.statusCode;
        return formatErrorResponse(
          error.code,
          error.message,
          env.nodeEnv === 'production' ? undefined : error.details
        );
      }

      // Unknown / unhandled errors
      logger.error({ error }, 'Unhandled error');
      set.status = 500;
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

      return formatErrorResponse(
        'INTERNAL_ERROR',
        env.nodeEnv === 'production' ? 'An internal error occurred' : errorMessage
      );
    })

    /**
     * Root endpoint — API information.
     */
    .get('/', () => ({
      name: 'Champions Clash API',
      message: 'API is running',
      version: '1.0.0',
    }))

    /**
     * Mount versioned API routes.
     */
    .use(apiRoutes);

  return app;
}

/**
 * Main application bootstrap.
 * Initializes all services and starts the server.
 * Each worker process runs this independently.
 */
async function main() {
  const env = getEnvConfig();
  const rootLogger = getLogger();
  const workerId = cluster.isPrimary ? 'primary' : process.pid;

  rootLogger.info({ nodeEnv: env.nodeEnv, workerId }, 'Starting Champions Clash API Server');

  await initDatabase();

  // Start background workers only on primary or worker 0 to avoid duplicate cron jobs
  const isWorkerZero = !cluster.isPrimary && cluster.worker?.id === 1;
  const shouldRunCrons = cluster.isPrimary || isWorkerZero;

  if (shouldRunCrons) {
    startCronWorker();
    rootLogger.info({ workerId }, 'Cron worker started');
  }

  // Create and configure app
  const app = createApp();

  /**
   * Graceful shutdown handler.
   * Closes all connections before exiting.
   * Forces exit after 10 seconds to prevent hanging.
   */
  const shutdown = async (signal: string) => {
    rootLogger.info({ signal, workerId }, 'Shutdown signal received');

    const forceExitTimeout = setTimeout(() => {
      rootLogger.fatal({ workerId }, 'Shutdown timed out after 10s — forcing exit');
      process.exit(1);
    }, 10000);

    try {
      await closeQueues();
      await closeRedis();
      await closeDatabase();
      clearTimeout(forceExitTimeout);
      rootLogger.info({ workerId }, 'Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      clearTimeout(forceExitTimeout);
      rootLogger.fatal({ error, workerId }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  app.listen(env.port);

  rootLogger.info(
    { port: env.port, url: `http://localhost:${env.port}`, workerId },
    'Server started successfully'
  );
}

/**
 * Cluster primary process handler.
 * Forks worker processes based on available CPU cores.
 */
function startClusterPrimary() {
  const rootLogger = getLogger();
  const numCpus = os.availableParallelism();

  rootLogger.info({ numCpus }, 'Starting cluster mode with workers');

  // Fork a worker for each available CPU core
  for (let i = 0; i < numCpus; i++) {
    cluster.fork();
  }

  // Handle worker exit events
  cluster.on('exit', (worker, code, signal) => {
    const reason = signal || code;
    rootLogger.warn(
      { workerId: worker.id, exitCode: code, signal },
      `Worker ${worker.id} died (${reason})`
    );

    // Restart the worker
    cluster.fork();
    rootLogger.info('Restarted worker');
  });

  rootLogger.info('Cluster primary process ready');
}

// Main entry point — clustering bootstrap
async function bootstrap() {
  const env = getEnvConfig();

  // Only use clustering in production; run single process in development/test
  if (env.nodeEnv !== 'production') {
    await main().catch((error) => {
      console.error('Failed to start application:', error);
      process.exit(1);
    });
    return;
  }

  // Production: use multi-CPU clustering
  if (cluster.isPrimary) {
    // Primary process: manage worker pool
    startClusterPrimary();
  } else {
    // Worker process: run the application
    await main().catch((error) => {
      console.error('Failed to start worker:', error);
      process.exit(1);
    });
  }
}

// Run the application with cluster support in production
bootstrap().catch((error) => {
  console.error('Failed to bootstrap application:', error);
  process.exit(1);
});
