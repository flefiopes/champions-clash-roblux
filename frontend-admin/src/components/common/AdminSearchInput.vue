<script setup lang="ts">
/**
 * AdminSearchInput Component
 * Provides a debounced search input with Lucide icons and PrimeVue InputText.
 */

import { ref, watch, onUnmounted } from 'vue';
import InputText from 'primevue/inputtext';
import { SearchIcon } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Search...',
  },
  debounceMs: {
    type: Number,
    default: 500,
  },
});

const emit = defineEmits(['update:modelValue', 'search']);

const localValue = ref(props.modelValue);
let timeout: ReturnType<typeof setTimeout> | null = null;

// Keep local value in sync with prop for external changes
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== localValue.value) {
      localValue.value = newVal;
    }
  },
);

function handleInput() {
  if (timeout) window.clearTimeout(timeout);
  timeout = window.setTimeout(() => {
    emit('update:modelValue', localValue.value);
    emit('search', localValue.value);
  }, props.debounceMs);
}

onUnmounted(() => {
  if (timeout) window.clearTimeout(timeout);
});
</script>

<template>
  <div class="relative w-full sm:w-80">
    <span
      class="absolute inset-y-0 left-3.5 flex items-center z-10 pointer-events-none"
    >
      <SearchIcon class="h-4 w-4 text-slate-400" />
    </span>
    <InputText
      v-model="localValue"
      :placeholder="placeholder"
      class="!pl-11 w-full !bg-slate-900 !border-slate-800 text-white focus:!border-indigo-500 transition-all placeholder:text-slate-500"
      @input="handleInput"
    />
  </div>
</template>
