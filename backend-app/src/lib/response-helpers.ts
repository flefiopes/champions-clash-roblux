/**
 * Response helper utilities for standardizing API responses.
 * All API endpoints should use these helpers for consistency.
 *
 * @module lib/response-helpers
 */

import type { ApiResponse, PaginatedResponse } from '@/types';

/**
 * Formats a single item response.
 * Used for GET single resource, POST create, PATCH/PUT update endpoints.
 *
 * @param data - The data to return
 * @returns Formatted API response
 *
 * @example
 * return formatResponse(user);
 */
export function formatResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Formats a list response (non-paginated).
 * Used for endpoints returning a simple array.
 *
 * @param items - Array of items
 * @returns Formatted API response with items array
 *
 * @example
 * return formatListResponse(users);
 */
export function formatListResponse<T>(items: T[]): ApiResponse<T[]> {
  return {
    success: true,
    data: items,
  };
}

/**
 * Formats a paginated response.
 * Converts backend pagination format to standard response format.
 *
 * @param items - Array of items for current page
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Formatted paginated API response
 *
 * @example
 * return formatPaginatedResponse(items, total, page, limit);
 */
export function formatPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): ApiResponse<PaginatedResponse<T>> {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data: {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    },
  };
}

/**
 * Formats a simple success response (e.g., for DELETE operations).
 * Use when you only need to indicate success without returning data.
 *
 * @returns Formatted success response
 *
 * @example
 * await deleteUser(id);
 * return formatSuccessResponse();
 */
export function formatSuccessResponse(): ApiResponse<void> {
  return {
    success: true,
  };
}

/**
 * Formats an error response.
 * Typically handled by error middleware, but available for custom error handling.
 *
 * @param code - Error code for programmatic handling
 * @param message - Human-readable error message
 * @param details - Optional additional error details
 * @returns Formatted error API response
 */
export function formatErrorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}
