<script setup lang="ts">
/**
 * PageHeader component.
 * Provides a consistent header for all administrative pages.
 *
 * @module components/common/PageHeader
 */

import Button from 'primevue/button';

defineProps<{
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonIcon?: string;
  buttonClass?: string;
}>();

defineEmits<{
  (e: 'action'): void;
}>();
</script>

<template>
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
    <div class="space-y-1">
      <h1 class="text-2xl font-black tracking-tight text-white flex items-center gap-3">
        <slot name="icon"></slot>
        {{ title }}
      </h1>
      <p v-if="subtitle" class="text-sm text-slate-400 font-medium">
        {{ subtitle }}
      </p>
    </div>

    <div v-if="buttonLabel" class="flex items-center gap-3">
      <Button
        :label="buttonLabel"
        :icon="buttonIcon"
        :class="[
          '!font-bold !rounded-xl !px-6 !py-3 !border-none shadow-lg shadow-indigo-500/20 transition-all active:scale-95',
          buttonClass || '!bg-indigo-600 hover:!bg-indigo-500',
        ]"
        @click="$emit('action')"
      />
      <slot name="extra-actions"></slot>
    </div>
  </div>
</template>
