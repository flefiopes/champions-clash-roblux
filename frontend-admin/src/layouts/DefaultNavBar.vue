<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-cream-200 bg-cream-50/80 backdrop-blur-md">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <RouterLink to="/" class="text-xl font-bold tracking-tight text-warm-600">
        <img class="inline-block h-6 w-auto align-middle" src="/vite.svg" alt="Logo" />
        <span class="ml-2 align-middle">Template</span>
      </RouterLink>

      <div class="flex items-center gap-6">
        <RouterLink
          to="/"
          class="text-sm font-medium text-cream-700 transition-colors hover:text-warm-600"
          active-class="!text-warm-600"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/about"
          class="text-sm font-medium text-cream-700 transition-colors hover:text-warm-600"
          active-class="!text-warm-600"
        >
          About
        </RouterLink>
      </div>
    </nav>
  </header>
</template>
