/**
 * Application error class with type-safe error codes.
 * Extends Error to provide consistent error handling across the application.
 *
 * @module lib/app-error
 */

/**
 * Enumeration of all possible application error codes.
 * Provides type-safe error identification and handling.
 */
export enum AppErrorCode {
  // Auth errors (401/403)
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  MISSING_TOKEN = 'MISSING_TOKEN',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',

  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',

  // Resource errors (404/409)
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',

  // File/upload errors (400/500)
  MISSING_FILE = 'MISSING_FILE',
  INVALID_FILE = 'INVALID_FILE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  DELETE_ERROR = 'DELETE_ERROR',

  // Limit errors (429/403)
  LIMIT_REACHED = 'LIMIT_REACHED',
  RATE_LIMITED = 'RATE_LIMITED',

  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Additional error details for error responses.
 */
export interface AppErrorDetails {
  [key: string]: unknown;
}

/**
 * Application-specific error class.
 * Provides type-safe error codes, HTTP status codes, and optional details.
 *
 * @example
 * throw new AppError(
 *   AppErrorCode.NOT_FOUND,
 *   "User not found",
 *   404,
 *   { userId }
 * );
 */
export class AppError extends Error {
  /**
   * Creates an AppError instance.
   *
   * @param code - Application error code
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code (default: 500)
   * @param details - Optional error details for debugging/logging
   */
  constructor(
    public code: AppErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: AppErrorDetails
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Type guard to check if an error is an AppError.
 *
 * @param error - Error to check
 * @returns True if error is an AppError instance
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
