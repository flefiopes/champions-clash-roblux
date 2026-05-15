<script setup lang="ts">
/**
 * AdminCard component.
 * Wrapper for main content areas like DataTables.
 *
 * @module components/common/AdminCard
 */

defineProps<{
  noPadding?: boolean;
}>();
</script>

<template>
  <div
    class="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/20 overflow-hidden"
  >
    <div :class="{ 'p-6': !noPadding }">
      <slot></slot>
    </div>
  </div>
</template>
