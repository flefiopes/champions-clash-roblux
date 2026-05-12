<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { LogOutIcon } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <header
    class="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-4"
  >
    <div class="flex items-center">
      <!-- Future breadcrumbs or title -->
    </div>

    <div class="flex items-center gap-4">
      <div class="flex items-center gap-3">
        <div class="flex flex-col text-right">
          <span class="text-sm font-medium text-slate-200">
            Admin User
          </span>
          <span class="text-xs text-slate-400">
            Administrator
          </span>
        </div>
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400"
        >
          A
        </div>
      </div>

      <div class="h-6 w-px bg-slate-800"></div>

      <button
        type="button"
        class="flex items-center gap-2 rounded-lg p-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
        title="Logout"
        @click="handleLogout"
      >
        <LogOutIcon class="h-5 w-5" />
      </button>
    </div>
  </header>
</template>
