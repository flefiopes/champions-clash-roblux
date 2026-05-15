<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { useAdminWars } from '@/composables/useAdminWars';
import type { War } from '@/types/admin.types';
import { AlertTriangleIcon } from 'lucide-vue-next';

const props = defineProps<{
  visible: boolean;
  war: War | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const { finishWar } = useAdminWars();
const isSubmitting = ref(false);

const close = () => {
  emit('update:visible', false);
};

const confirmFinish = async () => {
  if (!props.war) return;

  isSubmitting.value = true;
  try {
    await finishWar.mutateAsync(props.war.id);
    close();
  } catch (_error) {
    import('@/lib/toast').then(({ showErrorToast }) => {
      showErrorToast('Erreur lors de la clôture de la guerre');
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Terminer la guerre"
    :style="{ width: '28rem' }"
    :pt="{
      root: { class: 'bg-slate-900 border border-slate-800' },
      header: { class: 'bg-slate-900 border-b border-slate-800 text-white' },
      content: { class: 'bg-slate-900 pt-6' },
      footer: { class: 'bg-slate-900 border-t border-slate-800' },
    }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="flex items-start gap-4">
      <div class="rounded-full bg-red-500/10 p-3">
        <AlertTriangleIcon class="h-6 w-6 text-red-500" />
      </div>
      <div>
        <h3 class="text-base font-medium text-white">Êtes-vous sûr ?</h3>
        <p class="mt-2 text-sm text-slate-400">
          Vous êtes sur le point de terminer la guerre
          <span class="font-bold text-white">{{ war?.name }}</span
          >. Cette action va archiver les scores et n'est pas réversible.
        </p>
      </div>
    </div>

    <template #footer>
      <Button
        label="Annuler"
        icon="pi pi-times"
        text
        severity="secondary"
        class="!text-slate-400 hover:!text-white"
        @click="close"
      />
      <Button
        label="Terminer la guerre"
        icon="pi pi-check"
        severity="danger"
        :loading="isSubmitting"
        class="!bg-red-600 hover:!bg-red-500 !border-none"
        @click="confirmFinish"
      />
    </template>
  </Dialog>
</template>
