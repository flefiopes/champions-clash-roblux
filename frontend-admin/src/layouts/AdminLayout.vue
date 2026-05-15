<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterView } from 'vue-router';
import AdminSidebar from './AdminSidebar.vue';
import AdminTopbar from './AdminTopbar.vue';
import { useInactivityLogout } from '@/composables/useInactivityLogout';

const isSidebarOpen = ref(true);

// Initialize inactivity logout (1 hour timeout)
useInactivityLogout();

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

onMounted(() => {
  document.documentElement.classList.add('p-dark');
});

onUnmounted(() => {
  document.documentElement.classList.remove('p-dark');
});
</script>

<template>
  <div class="p-dark flex h-screen bg-slate-900 text-slate-100">
    <AdminSidebar :is-open="isSidebarOpen" @toggle="toggleSidebar" />
    <div class="flex flex-1 flex-col overflow-hidden">
      <AdminTopbar :is-sidebar-open="isSidebarOpen" @toggle-sidebar="toggleSidebar" />
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 p-6">
        <div class="mx-auto max-w-7xl">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>
