<script setup lang="ts">
/**
 * AdminStatsCard component.
 * Displays a single metric with an icon and optional trend.
 *
 * @module components/common/AdminStatsCard
 */
import type { Component } from 'vue';

defineProps<{
  label: string;
  value: string | number;
  icon?: Component;
  iconColorClass?: string;
  iconBgClass?: string;
  isLoading?: boolean;
}>();
</script>

<template>
  <div
    v-if="isLoading"
    class="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50 p-6 h-32"
  ></div>
  <div
    v-else
    class="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm transition-all hover:border-slate-700 group"
  >
    <div
      v-if="icon"
      class="absolute -right-6 -top-6 rounded-full p-10 transition-transform group-hover:scale-110"
      :class="iconBgClass || 'bg-slate-800/50'"
    >
      <component :is="icon" class="h-8 w-8" :class="iconColorClass || 'text-slate-400'" />
    </div>

    <dt class="truncate text-sm font-bold text-slate-500 uppercase tracking-wider">{{ label }}</dt>
    <dd class="mt-2 text-3xl font-black tracking-tight text-white font-mono">
      {{ value }}
    </dd>

    <div class="mt-4 flex items-center">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
