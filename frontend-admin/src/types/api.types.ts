/**
 * Shared API response types.
 * Mirrors the backend's standard response format to ensure type-safe communication.
 *
 * @module types/api
 */

/**
 * Standard API error shape returned by the backend.
 *
 * @property code - Machine-readable error code (e.g. "VALIDATION_ERROR")
 * @property message - Human-readable error description
 * @property details - Optional extra debugging payload (omitted in production)
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Standard API response envelope.
 * Every backend endpoint wraps its payload in this format.
 *
 * @typeParam T - The type of the response data payload
 * @property success - Whether the request succeeded
 * @property data - The response data (present on success)
 * @property error - Error details (present on failure)
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * Pagination metadata returned alongside paginated lists.
 *
 * @property page - Current page number (1-indexed)
 * @property limit - Number of items per page
 * @property total - Total number of matching items
 * @property totalPages - Total number of available pages
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response wrapper used by list endpoints.
 *
 * @typeParam T - The type of each item in the list
 * @property data - Array of items for the current page
 * @property pagination - Pagination metadata
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
