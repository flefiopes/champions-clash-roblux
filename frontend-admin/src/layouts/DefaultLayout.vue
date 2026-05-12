<script setup lang="ts">
import DefaultFooter from './DefaultFooter.vue';
import DefaultNavBar from './DefaultNavBar.vue';
</script>

<template>
  <div
    class="flex h-screen flex-col overflow-hidden bg-cream-50 text-cream-900"
  >
    <!-- Navbar -->
    <DefaultNavBar />

    <!-- Scrollable area -->
    <div class="flex-1 overflow-y-auto w-full flex flex-col">
      <!-- Main content -->
      <main class="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <slot></slot>
      </main>

      <!-- Footer -->
      <DefaultFooter />
    </div>
  </div>
</template>
