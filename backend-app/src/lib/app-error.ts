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
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  INVALID_ACTION = 'INVALID_ACTION',

  // Resource errors (404/409)
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',

  // Player errors (400/404/409)
  PLAYER_NOT_FOUND = 'PLAYER_NOT_FOUND',
  INSUFFICIENT_COINS = 'INSUFFICIENT_COINS',
  INSUFFICIENT_GEMS = 'INSUFFICIENT_GEMS',

  // Faction / war errors (400/404/409)
  WAR_NOT_FOUND = 'WAR_NOT_FOUND',
  FACTION_NOT_FOUND = 'FACTION_NOT_FOUND',
  INVALID_FACTION = 'INVALID_FACTION',
  /** Player already belongs to a faction for this war and the 7-day lock is active */
  FACTION_LOCK_ACTIVE = 'FACTION_LOCK_ACTIVE',
  /** Faction does not belong to the specified war */
  FACTION_WAR_MISMATCH = 'FACTION_WAR_MISMATCH',

  // Purchase errors (400/409)
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  PRODUCT_INACTIVE = 'PRODUCT_INACTIVE',
  /** purchaseId has already been processed — idempotent no-op */
  PURCHASE_ALREADY_PROCESSED = 'PURCHASE_ALREADY_PROCESSED',

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
 * throw new AppError(AppErrorCode.INSUFFICIENT_COINS, 'Not enough coins', 400, { required: 500, current: 200 });
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
