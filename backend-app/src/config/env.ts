/**
 * Environment configuration module.
 * Provides type-safe access to environment variables with validation.
 * All env vars are loaded once and cached for the application lifetime.
 *
 * @module config/env
 */

/**
 * Application environment type.
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Log level type for Pino logger.
 */
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

/**
 * Environment configuration interface.
 * Defines all required environment variables with their types.
 */
export interface EnvConfig {
  // Server
  readonly port: number;
  readonly nodeEnv: Environment;

  // CORS
  readonly corsOrigin: string;

  // Logging
  readonly logLevel: LogLevel;

  // Database
  readonly database: {
    readonly host: string;
    readonly port: number;
    readonly user: string;
    readonly password: string;
    readonly name: string;
    readonly connectionLimit: number;
  };

  // Redis
  readonly redis: {
    readonly host: string;
    readonly port: number;
    readonly password: string | undefined;
  };

  // Logging (file rotation)
  readonly log: {
    readonly filePath: string;
    readonly rotationFrequency: string;
    readonly rotationSize: string;
    readonly retentionCount: number;
  };

  // Security — API keys
  readonly security: {
    /** Shared secret used by Roblox game servers (X-API-Key header) */
    readonly robloxApiKey: string;
    /** Separate secret for the admin dashboard (X-Admin-Key header) */
    readonly adminApiKey: string;
  };

  // External integrations
  readonly discord: {
    /** Webhook URL for war-reset notifications (optional) */
    readonly webhookUrl: string | undefined;
  };

  // Cron
  readonly cron: {
    readonly workerConcurrency: number;
  };

  // Job queue defaults (BullMQ)
  readonly queue: {
    readonly maxAttempts: number;
    readonly backoffDelayMs: number;
    readonly removeOnComplete: number;
    readonly removeOnFail: number;
  };

  // Rate limiting
  readonly rateLimit: {
    /** Max coin-gain calls per player per window (anti-farming) */
    readonly robloxCoinGainMax: number;
    readonly robloxCoinGainWindowSeconds: number;
    /** Max point-contribution calls per player per window */
    readonly robloxPointContribMax: number;
    readonly robloxPointContribWindowSeconds: number;
    /** Max purchase calls per player per window */
    readonly robloxPurchaseMax: number;
    readonly robloxPurchaseWindowSeconds: number;
    /** Admin endpoint rate limiting */
    readonly adminMax: number;
    readonly adminWindowSeconds: number;
  };
}

/**
 * Retrieves an environment variable or throws if missing and required.
 *
 * @param key - Environment variable name
 * @param defaultValue - Optional default value
 * @returns The environment variable value
 * @throws Error if variable is missing and no default provided
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;

  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

/**
 * Parses and validates all environment variables.
 * Should be called once at application startup.
 *
 * @returns Validated environment configuration object
 */
export function loadEnvConfig(): EnvConfig {
  return {
    port: Number(getEnvVar('PORT', '3000')),
    nodeEnv: getEnvVar('NODE_ENV', 'development') as Environment,
    corsOrigin: getEnvVar('CORS_ORIGIN', '*'),
    logLevel: getEnvVar('LOG_LEVEL', 'info') as LogLevel,

    database: {
      host: getEnvVar('DATABASE_HOST', 'localhost'),
      port: Number(getEnvVar('DATABASE_PORT', '3306')),
      user: getEnvVar('DATABASE_USER'),
      password: getEnvVar('DATABASE_PASSWORD'),
      name: getEnvVar('DATABASE_NAME'),
      connectionLimit: Number(getEnvVar('DATABASE_CONNECTION_LIMIT', '10')),
    },

    redis: {
      host: getEnvVar('REDIS_HOST', 'localhost'),
      port: Number(getEnvVar('REDIS_PORT', '6379')),
      password: process.env.REDIS_PASSWORD || undefined,
    },

    log: {
      filePath: getEnvVar('LOG_FILE_PATH', './logs/app.log'),
      rotationFrequency: getEnvVar('LOG_ROTATION_FREQUENCY', 'daily'),
      rotationSize: getEnvVar('LOG_ROTATION_SIZE', '10m'),
      retentionCount: Number(getEnvVar('LOG_RETENTION_COUNT', '14')),
    },

    security: {
      robloxApiKey: getEnvVar('ROBLOX_API_KEY'),
      adminApiKey: getEnvVar('ADMIN_API_KEY'),
    },

    discord: {
      webhookUrl: process.env.DISCORD_WEBHOOK_URL || undefined,
    },

    cron: {
      workerConcurrency: Number(getEnvVar('CRON_WORKER_CONCURRENCY', '1')),
    },

    queue: {
      maxAttempts: Number(getEnvVar('JOB_MAX_ATTEMPTS', '3')),
      backoffDelayMs: Number(getEnvVar('JOB_BACKOFF_DELAY_MS', '1000')),
      removeOnComplete: Number(getEnvVar('JOB_REMOVE_ON_COMPLETE', '100')),
      removeOnFail: Number(getEnvVar('JOB_REMOVE_ON_FAIL', '50')),
    },

    rateLimit: {
      robloxCoinGainMax: Number(getEnvVar('RATE_LIMIT_COIN_GAIN_MAX', '20')),
      robloxCoinGainWindowSeconds: Number(getEnvVar('RATE_LIMIT_COIN_GAIN_WINDOW', '60')),
      robloxPointContribMax: Number(getEnvVar('RATE_LIMIT_POINT_CONTRIB_MAX', '30')),
      robloxPointContribWindowSeconds: Number(getEnvVar('RATE_LIMIT_POINT_CONTRIB_WINDOW', '60')),
      robloxPurchaseMax: Number(getEnvVar('RATE_LIMIT_PURCHASE_MAX', '10')),
      robloxPurchaseWindowSeconds: Number(getEnvVar('RATE_LIMIT_PURCHASE_WINDOW', '60')),
      adminMax: Number(getEnvVar('RATE_LIMIT_ADMIN_MAX', '60')),
      adminWindowSeconds: Number(getEnvVar('RATE_LIMIT_ADMIN_WINDOW', '60')),
    },
  };
}

/**
 * Cached environment configuration instance.
 * Initialized lazily on first access.
 */
let envConfigInstance: EnvConfig | null = null;

/**
 * Returns the cached environment configuration.
 * Initializes the configuration on first call.
 *
 * @returns The environment configuration object
 */
export function getEnvConfig(): EnvConfig {
  if (!envConfigInstance) {
    envConfigInstance = loadEnvConfig();
  }
  return envConfigInstance;
}
