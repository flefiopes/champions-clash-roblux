/**
 * Axios-based API client.
 * Provides a configured Axios instance with request/response interceptors
 * for Admin authentication.
 *
 * @module lib/api-client
 */

import axios, { isAxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/api.types';
import { getAdminKey, clearAdminKey } from '@/lib/token-storage';
import { showErrorToast } from '@/lib/toast';

/** Base URL for the backend API, read from environment variable */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Creates and configures the Axios instance.
 * Sets up base URL, credentials, and content type defaults.
 *
 * @returns Configured Axios instance
 */
function createApiInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });

  // Request interceptor: attach admin key
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const key = getAdminKey();
      if (key && config.headers) {
        config.headers['X-Admin-Key'] = key;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor: handle errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle unauthorized specifically if needed (e.g. key revoked)
      if (error.response?.status === 401 || error.response?.status === 403) {
        clearAdminKey();
        showErrorToast('Admin key invalid or expired. Please login again.', 'Unauthorized');
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

/** Singleton Axios instance with auth interceptors */
export const apiClient = createApiInstance();

/**
 * Type-safe API request wrapper.
 * Unwraps the ApiResponse envelope and returns only the data payload.
 * Throws an error with the backend error message on failure.
 *
 * @typeParam T - Expected response data type
 * @param config - Axios request configuration
 * @returns The unwrapped data payload
 * @throws Error with backend error message or generic message
 */
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<ApiResponse<T>>(config);
    const body = response.data;

    if (!body.success) {
      // Logic error from backend (2xx status but success=false)
      const errorMsg = body.error?.message || 'An unknown error occurred';
      showErrorToast(errorMsg);
      throw new Error(errorMsg);
    }

    // Success response - return data payload if present, otherwise return as T
    return body.data as T;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      // HTTP error (4xx, 5xx)
      if (error.response.status !== 401 && error.response.status !== 403) {
        const backendMessage = (error.response.data as ApiResponse<unknown>)?.error?.message;
        const msg = backendMessage || error.message || 'An error occurred during the request';
        showErrorToast(msg);
      }
    } else if (isAxiosError(error) && error.request) {
      // Network error (no response)
      showErrorToast('Network error: Unable to reach the server', 'Connection error');
    }
    // Re-throw so callers can handle specific UI states
    throw error;
  }
}

