<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { RouterView } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import type { ToastMessageOptions } from 'primevue/toast';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { GLOBAL_TOAST_EVENT } from '@/lib/toast';

const toast = useToast();

const handleGlobalToast = (event: Event) => {
  const customEvent = event as CustomEvent<ToastMessageOptions>;
  toast.add(customEvent.detail);
};

onMounted(() => {
  window.addEventListener(GLOBAL_TOAST_EVENT, handleGlobalToast);
});

onUnmounted(() => {
  window.removeEventListener(GLOBAL_TOAST_EVENT, handleGlobalToast);
});
</script>

<template>
  <Toast />
  <ConfirmDialog />
  <RouterView />
</template>

<style>
/* Global resets */
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
