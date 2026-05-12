/**
 * Base type definitions shared across the application.
 * Provides foundational types for API responses, pagination, and common patterns.
 *
 * @module types/base
 */

/**
 * UUID v4 string type alias.
 * Used for entity identifiers throughout the application.
 */
export type UUID = string;

/**
 * ISO 8601 date string type alias.
 */
export type ISODateString = string;

/**
 * Pagination parameters for list endpoints.
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page: number;
  /** Items per page */
  limit: number;
}

/**
 * Paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  data: T[];
  /** Pagination metadata */
  pagination: {
    /** Current page number */
    page: number;
    /** Items per page */
    limit: number;
    /** Total number of items */
    total: number;
    /** Total number of pages */
    totalPages: number;
  };
}

/**
 * API error response format.
 */
export interface ApiError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Additional error details (omitted in production) */
  details?: Record<string, unknown>;
}

/**
 * Standard API response wrapper.
 * All endpoints should return this format for consistency.
 */
export interface ApiResponse<T> {
  /** Response success status */
  success: boolean;
  /** Response data (on success) */
  data?: T;
  /** Error information (on failure) */
  error?: ApiError;
}
