<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import { useAuthStore } from '@/stores/auth';
import Password from 'primevue/password';
import Button from 'primevue/button';

const router = useRouter();
const authStore = useAuthStore();

onMounted(() => {
  document.documentElement.classList.add('p-dark');
});

onUnmounted(() => {
  document.documentElement.classList.remove('p-dark');
});

const isSubmitting = ref(false);
const globalError = ref('');

const loginSchema = z.object({
  adminKey: z.string().min(1, 'Admin key is required'),
});

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(loginSchema),
});

const [adminKey, adminKeyProps] = defineField('adminKey');

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true;
  globalError.value = '';

  try {
    const success = await authStore.login(values.adminKey);
    if (success) {
      router.push('/');
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      globalError.value = e.message || 'Login failed';
    } else {
      globalError.value = 'Login failed';
    }
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <div class="p-dark flex min-h-screen items-center justify-center bg-slate-950 px-4">
    <div class="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
      <div class="text-center">
        <h2 class="text-3xl font-bold tracking-tight text-white">
          Champions Clash
        </h2>
        <p class="mt-2 text-sm text-slate-400">
          Enter Admin Key to access the dashboard
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit="onSubmit">
        <div v-if="globalError" class="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 text-center">
          {{ globalError }}
        </div>

        <div class="space-y-4">
          <div>
            <label for="adminKey" class="mb-2 block text-sm font-medium text-slate-300">Admin Key</label>
            <Password
              id="adminKey"
              v-model="adminKey"
              v-bind="adminKeyProps"
              :feedback="false"
              toggle-mask
              input-class="w-full !bg-slate-950 !border-slate-800 !text-white"
              class="w-full"
              :class="{ 'p-invalid': errors.adminKey }"
            />
            <small class="text-red-400 mt-1 block">{{ errors.adminKey }}</small>
          </div>
        </div>

        <Button
          type="submit"
          label="Access Dashboard"
          class="w-full !bg-indigo-600 !border-0 hover:!bg-indigo-500 font-semibold"
          :loading="isSubmitting"
        />
      </form>
    </div>
  </div>
</template>

