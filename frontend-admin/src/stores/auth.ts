/**
 * Pinia authentication store for Admin Dashboard.
 *
 * @module stores/auth
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getAdminKey, setAdminKey, clearAdminKey } from '@/lib/token-storage';
import { apiClient } from '@/lib/api-client';

export const useAuthStore = defineStore('auth', () => {
  const adminKey = ref<string | null>(null);
  const isLoading = ref(false);
  const isInitialized = ref(false);

  const isAuthenticated = computed(() => !!adminKey.value);

  async function login(key: string): Promise<boolean> {
    isLoading.value = true;
    try {
      // Validate key by pinging the admin health or an admin endpoint
      // We'll use the transactions endpoint with limit=1 to verify the key
      await apiClient.get('/admin/transactions?limit=1', {
        headers: { 'X-Admin-Key': key },
      });
      setAdminKey(key);
      adminKey.value = key;
      return true;
    } finally {
      isLoading.value = false;
    }
  }

  function logout(): void {
    clearAdminKey();
    adminKey.value = null;
  }

  function initAuth(): void {
    if (isInitialized.value) return;

    const token = getAdminKey();
    if (token) {
      adminKey.value = token;
    }
    isInitialized.value = true;
  }

  return {
    adminKey,
    isLoading,
    isInitialized,
    isAuthenticated,
    login,
    logout,
    initAuth,
  };
});

