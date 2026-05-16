import axios from 'axios';

/**
 * Test client configuration.
 * Centralized axios instances for testing Roblox and Admin routes.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000/api/v1';
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY || 'change_me_roblox_api_key';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'change_me_admin_api_key';

/**
 * Axios instance for Roblox-facing endpoints.
 * Automatically includes the X-API-Key header.
 */
export const robloxClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-API-Key': ROBLOX_API_KEY,
    'Content-Type': 'application/json',
  },
  validateStatus: () => true, // Don't throw on error status codes
});

/**
 * Axios instance for Admin endpoints.
 * Automatically includes the X-Admin-Key header.
 */
export const adminClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-Admin-Key': ADMIN_API_KEY,
    'Content-Type': 'application/json',
  },
  validateStatus: () => true, // Don't throw on error status codes
});
