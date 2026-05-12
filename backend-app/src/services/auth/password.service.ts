/**
 * Password service module.
 * Handles password hashing and verification using Bun's native argon2id.
 *
 * @module services/auth/password
 */

import { loggers } from '@/lib/logger';

/** Password service logger */
const logger = loggers.auth();

/**
 * Hashes a password using Bun's native argon2id implementation.
 *
 * @param password - Plain text password
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  logger.debug('Hashing password');

  const hash = await Bun.password.hash(password, {
    algorithm: 'argon2id',
    memoryCost: 65536,
    timeCost: 4,
  });

  return hash;
}

/**
 * Verifies a password against a stored hash.
 *
 * @param password - Plain text password to verify
 * @param hash - Stored password hash
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  logger.debug('Verifying password');
  return Bun.password.verify(password, hash);
}
