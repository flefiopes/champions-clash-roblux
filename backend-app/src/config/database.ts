/**
 * Database configuration module.
 * Provides MySQL connection configuration for Drizzle ORM.
 *
 * @module config/database
 */

import { getEnvConfig } from './env';

/**
 * Database connection configuration interface.
 */
export interface DatabaseConfig {
  readonly host: string;
  readonly port: number;
  readonly user: string;
  readonly password: string;
  readonly database: string;
  readonly connectionLimit: number;
}

/**
 * Retrieves the database configuration from environment variables.
 *
 * @returns Database connection configuration object
 */
export function getDatabaseConfig(): DatabaseConfig {
  const env = getEnvConfig();

  return {
    host: env.database.host,
    port: env.database.port,
    user: env.database.user,
    password: env.database.password,
    database: env.database.name,
    connectionLimit: env.database.connectionLimit,
  };
}
