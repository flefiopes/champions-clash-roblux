/**
 * Pino logger configuration module.
 * Provides high-performance structured logging with context support.
 * Uses pretty printing in development, JSON in production.
 *
 * @module lib/logger
 */

import pino, { type Logger, type LoggerOptions } from 'pino';
import { getEnvConfig, type LogLevel } from '@/config/env';

/**
 * Creates Pino logger options based on the current environment.
 * Uses pretty printing in development, JSON + file rotation in production.
 *
 * @param level - Log level to use
 * @returns Pino logger options
 */
function createLoggerOptions(level: LogLevel): LoggerOptions {
  const env = getEnvConfig();
  const isDevelopment = env.nodeEnv === 'development';

  const baseOptions: LoggerOptions = {
    level,
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  const targets: pino.TransportTargetOptions[] = [];

  // Console: pretty in dev, JSON stdout in prod
  if (isDevelopment) {
    targets.push({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'hostname',
      },
    });
  } else {
    targets.push({
      target: 'pino/file',
      options: { destination: 1 },
    });
  }

  // File logging with rotation
  targets.push({
    target: 'pino-roll',
    options: {
      file: env.log.filePath,
      frequency: env.log.rotationFrequency,
      size: env.log.rotationSize,
      mkdir: true,
      limit: {
        count: env.log.retentionCount,
      },
    },
  });

  return {
    ...baseOptions,
    transport: { targets },
  };
}

/**
 * Root logger instance. Lazily initialized on first access.
 */
let rootLogger: Logger | null = null;

/**
 * Initializes and returns the root logger instance.
 *
 * @returns The root Pino logger instance
 */
export function getLogger(): Logger {
  if (!rootLogger) {
    const env = getEnvConfig();
    const options = createLoggerOptions(env.logLevel);
    rootLogger = pino(options);
  }
  return rootLogger;
}

/**
 * Creates a child logger with additional context.
 *
 * @param bindings - Additional context to include in all log entries
 * @returns A child logger with the specified context
 *
 * @example
 * const dbLogger = createChildLogger({ module: "database" });
 * dbLogger.info("Connected to database");
 */
export function createChildLogger(bindings: Record<string, unknown>): Logger {
  return getLogger().child(bindings);
}

/**
 * Pre-configured loggers for common modules.
 */
export const loggers = {
  /** Logger for HTTP request handling */
  http: () => createChildLogger({ module: 'http' }),
  /** Logger for database operations */
  db: () => createChildLogger({ module: 'database' }),
  /** Logger for Redis operations */
  redis: () => createChildLogger({ module: 'redis' }),
  /** Logger for storage operations */
  storage: () => createChildLogger({ module: 'storage' }),
  /** Logger for authentication */
  auth: () => createChildLogger({ module: 'auth' }),
  /** Logger for worker processes */
  worker: () => createChildLogger({ module: 'worker' }),
};
