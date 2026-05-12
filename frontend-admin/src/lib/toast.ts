/**
 * Global toast notification utility.
 * Uses a native CustomEvent to dispatch toasts from anywhere in the application,
 * including non-Vue contexts like Axios interceptors.
 *
 * @module lib/toast
 */

import type { ToastMessageOptions } from 'primevue/toast';

/** Name of the custom event used to broadcast toast messages */
export const GLOBAL_TOAST_EVENT = 'global-toast';

/**
 * Dispatches a global toast event to be caught by the root App component.
 *
 * @param options - PrimeVue ToastMessageOptions (severity, summary, detail, life, etc.)
 */
export function showGlobalToast(options: ToastMessageOptions): void {
  // Use a sensible default lifespan if not provided (4 seconds)
  const event = new CustomEvent<ToastMessageOptions>(GLOBAL_TOAST_EVENT, {
    detail: {
      life: 4000,
      ...options,
    },
  });

  // Dispatch on the global window object
  if (typeof window !== 'undefined') {
    window.dispatchEvent(event);
  }
}

/**
 * Convenience helper to show a generic error toast.
 *
 * @param message - User-friendly error message
 * @param summary - Short title for the toast (defaults to "Error")
 */
export function showErrorToast(message: string, summary = 'Error'): void {
  showGlobalToast({
    severity: 'error',
    summary,
    detail: message,
  });
}

/**
 * Convenience helper to show a generic success toast.
 *
 * @param message - User-friendly success message
 * @param summary - Short title for the toast (defaults to "Success")
 */
export function showSuccessToast(message: string, summary = 'Success'): void {
  showGlobalToast({
    severity: 'success',
    summary,
    detail: message,
  });
}

/**
 * Convenience helper to show an info toast.
 *
 * @param message - User-friendly info message
 * @param summary - Short title for the toast (defaults to "Info")
 */
export function showInfoToast(message: string, summary = 'Info'): void {
  showGlobalToast({
    severity: 'info',
    summary,
    detail: message,
  });
}
