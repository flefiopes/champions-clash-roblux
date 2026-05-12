/**
 * Database connection module.
 * Initializes Drizzle ORM with MySQL connection.
 *
 * @module db
 */

import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { getDatabaseConfig } from '@/config';
import { createChildLogger } from '@/lib/logger';
import * as schema from './schema';

/** Database module logger */
const logger = createChildLogger({ module: 'database' });

/** Type alias for the database instance */
export type Database = MySql2Database<typeof schema>;

/**
 * MySQL connection pool instance.
 * Lazily initialized on first database access.
 */
let pool: mysql.Pool | null = null;

/**
 * Drizzle ORM database instance.
 * Lazily initialized on first database access.
 */
let db: Database | null = null;

/**
 * Creates and returns the MySQL connection pool.
 * Uses connection pooling for optimal performance.
 *
 * @returns MySQL connection pool
 */
function createPool(): mysql.Pool {
  const config = getDatabaseConfig();

  logger.info(
    { host: config.host, database: config.database },
    'Creating database connection pool'
  );

  return mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    // Connection pool settings
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Enable keep-alive to prevent connection drops
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });
}

/**
 * Initializes the database connection.
 * Should be called once at server startup.
 *
 * @returns Drizzle ORM database instance
 */
export function initDatabase(): Database {
  if (!db) {
    pool = createPool();
    db = drizzle(pool, { schema, mode: 'default' });
    logger.info('Database connection initialized');
  }
  return db;
}

/**
 * Returns the Drizzle ORM database instance.
 * Must call initDatabase() first at server startup.
 *
 * @returns Drizzle ORM database instance with schema
 * @throws Error if database is not initialized
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Closes the database connection pool.
 * Should be called during graceful shutdown.
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    logger.info('Closing database connection pool');
    await pool.end();
    pool = null;
    db = null;
    logger.info('Database connection pool closed');
  }
}

// Re-export schema for convenience
export { schema };
