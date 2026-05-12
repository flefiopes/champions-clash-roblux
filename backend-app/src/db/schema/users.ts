/**
 * Users table schema definition.
 * Defines the core users table with authentication fields.
 * Email is encrypted (AES-256-GCM) and indexed via blind index (HMAC-SHA256).
 *
 * @module db/schema/users
 */

import { mysqlTable, varchar, timestamp, mysqlEnum, boolean } from 'drizzle-orm/mysql-core';

/**
 * Users table.
 * Stores user accounts with authentication and profile information.
 */
export const users = mysqlTable('users', {
  /** Primary key (UUID v4) */
  id: varchar('id', { length: 36 }).primaryKey(),

  /** AES-256-GCM encrypted email (iv:ciphertext:authTag in base64) */
  emailEncrypted: varchar('email_encrypted', { length: 512 }).notNull(),

  /** HMAC-SHA256 blind index for email lookups (unique constraint) */
  emailBlindIndex: varchar('email_blind_index', { length: 64 }).notNull().unique(),

  /** Argon2id password hash */
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),

  /** Unique username */
  username: varchar('username', { length: 100 }).notNull().unique(),

  /** User role */
  role: mysqlEnum('role', ['user', 'admin']).notNull().default('user'),

  /** Whether the email has been verified */
  isVerifiedEmail: boolean('is_verified_email').notNull().default(false),

  /** Account status */
  accountStatus: mysqlEnum('account_status', ['active', 'suspended', 'deleted'])
    .notNull()
    .default('active'),

  /** Record creation timestamp */
  createdAt: timestamp('created_at').notNull().defaultNow(),

  /** Record last update timestamp */
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});
