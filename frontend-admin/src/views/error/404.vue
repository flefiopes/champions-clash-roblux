<script setup lang="ts">

import { onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import Button from 'primevue/button';
import { HomeIcon } from 'lucide-vue-next';

onMounted(() => {
  window.document.documentElement.classList.add('p-dark');
});

onUnmounted(() => {
  window.document.documentElement.classList.remove('p-dark');
});
</script>

<template>
  <div
    class="p-dark flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center transition-colors duration-500"
  >
    <div
      class="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-12 shadow-2xl backdrop-blur-xl"
    >
      <!-- Decorative background blur effects -->
      <div
        class="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl"
      ></div>
      <div
        class="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl"
      ></div>

      <div class="relative z-10 flex flex-col items-center">
        <h1
          class="mb-2 text-7xl font-black tracking-tight text-white sm:text-8xl"
        >
          404
        </h1>

        <h2 class="mb-6 text-2xl font-bold text-slate-100 sm:text-3xl">
          Page Not Found
        </h2>

        <p class="mb-10 text-lg leading-relaxed text-slate-400">
          The page you're looking for doesn't exist or has been moved to a
          different location.
        </p>

        <RouterLink to="/">
          <Button
            class="!rounded-xl !bg-indigo-600 px-8 py-3 !border-0 hover:!bg-indigo-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-600/20"
          >
            <template #default>
              <div class="flex items-center gap-2">
                <HomeIcon class="h-5 w-5" />
                <span class="font-semibold">Return to dashboard</span>
              </div>
            </template>
          </Button>
        </RouterLink>
      </div>
    </div>

    <!-- Background text watermark -->
    <div
      class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.02]"
    >
      <span class="select-none text-[20rem] font-black">LOST</span>
    </div>
  </div>
</template>
