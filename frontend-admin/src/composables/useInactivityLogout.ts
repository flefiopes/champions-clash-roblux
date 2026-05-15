/**
 * Composable for automatic logout after a period of inactivity.
 *
 * @module composables/useInactivityLogout
 */

import { onMounted, onUnmounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

/** Default timeout duration: 1 hour (in milliseconds) */
const DEFAULT_TIMEOUT = 60 * 60 * 1000;

/**
 * Initializes inactivity detection.
 * Listens for mouse movement, key presses, and scrolls to reset the timer.
 *
 * @param timeoutMs - Duration before logout in milliseconds
 */
export function useInactivityLogout(timeoutMs: number = DEFAULT_TIMEOUT) {
  const authStore = useAuthStore();
  const router = useRouter();
  const timer = ref<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    if (timer.value) {
      clearTimeout(timer.value);
    }

    timer.value = setTimeout(() => {
      logout();
    }, timeoutMs);
  };

  const logout = () => {
    if (authStore.isAuthenticated) {
      authStore.logout();
      router.push('/login');
    }
  };

  const activityEvents = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
  ];

  onMounted(() => {
    // Only start if authenticated
    if (authStore.isAuthenticated) {
      resetTimer();
      activityEvents.forEach((event) => {
        window.addEventListener(event, resetTimer);
      });
    }
  });

  onUnmounted(() => {
    if (timer.value) {
      clearTimeout(timer.value);
    }
    activityEvents.forEach((event) => {
      window.removeEventListener(event, resetTimer);
    });
  });

  return {
    resetTimer,
  };
}
