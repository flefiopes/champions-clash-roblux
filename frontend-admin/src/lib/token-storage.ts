/**
 * Admin API Key storage utility.
 * Manages key persistence using sessionStorage.
 *
 * @module lib/token-storage
 */

/** SessionStorage key for the admin api key */
const ADMIN_KEY = 'admin_api_key';

/**
 * Checks whether the code is running in a browser environment.
 *
 * @returns True if window and document are available
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Retrieves the stored admin key.
 *
 * @returns The admin key string or null if not stored
 */
export function getAdminKey(): string | null {
  if (!isBrowser()) return null;
  return sessionStorage.getItem(ADMIN_KEY);
}

/**
 * Stores the admin key.
 *
 * @param key - The Admin API Key to store
 */
export function setAdminKey(key: string): void {
  if (!isBrowser()) return;
  sessionStorage.setItem(ADMIN_KEY, key);
}

/**
 * Clears the stored admin key.
 */
export function clearAdminKey(): void {
  if (!isBrowser()) return;
  sessionStorage.removeItem(ADMIN_KEY);
}
