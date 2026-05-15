<script setup lang="ts">
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import { useAdminWars } from '@/composables/useAdminWars';
import type { War, CreateWarDto, UpdateWarDto } from '@/types/admin.types';

const props = defineProps<{
  visible: boolean;
  war: War | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const { createWar, updateWar } = useAdminWars();

const form = ref({
  name: '',
  reset_weekly: true,
  scheduled_at: null as Date | null,
  ends_at: null as Date | null,
});

watch(
  () => props.war,
  (newWar) => {
    if (newWar) {
      form.value = {
        name: newWar.name,
        reset_weekly: newWar.resetWeekly,
        scheduled_at: newWar.scheduledAt ? new Date(newWar.scheduledAt) : null,
        ends_at: newWar.endsAt ? new Date(newWar.endsAt) : null,
      };
    } else {
      form.value = {
        name: '',
        reset_weekly: true,
        scheduled_at: null,
        ends_at: null,
      };
    }
  },
  { immediate: true }
);

const isSubmitting = ref(false);

const close = () => {
  emit('update:visible', false);
};

const save = async () => {
  if (!form.value.name.trim()) return;

  isSubmitting.value = true;

  try {
    if (props.war) {
      // Edit
      const dto: UpdateWarDto = {
        name: form.value.name,
        reset_weekly: form.value.reset_weekly,
        scheduled_at: form.value.scheduled_at ? form.value.scheduled_at.toISOString() : null,
        ends_at: form.value.ends_at ? form.value.ends_at.toISOString() : null,
      };
      await updateWar.mutateAsync({ id: props.war.id, data: dto });
    } else {
      // Create
      const dto: CreateWarDto = {
        name: form.value.name,
        reset_weekly: form.value.reset_weekly,
        scheduled_at: form.value.scheduled_at ? form.value.scheduled_at.toISOString() : null,
        ends_at: form.value.ends_at ? form.value.ends_at.toISOString() : null,
      };
      await createWar.mutateAsync(dto);
    }
    close();
  } catch (_error) {
    import('@/lib/toast').then(({ showErrorToast }) => {
      showErrorToast('Erreur lors de la sauvegarde de la guerre');
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
    :header="war ? 'Modifier la guerre' : 'Créer une nouvelle guerre'"
    :style="{ width: '30rem' }"
    :pt="{
      root: { class: 'bg-slate-900 border border-slate-800' },
      header: { class: 'bg-slate-900 border-b border-slate-800 text-white' },
      content: { class: 'bg-slate-900 pt-6' },
      footer: { class: 'bg-slate-900 border-t border-slate-800' },
    }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <label for="name" class="text-sm font-medium text-slate-300">Nom de la saison</label>
        <InputText
          id="name"
          v-model="form.name"
          autocomplete="off"
          class="!bg-slate-950 !border-slate-800 !text-white"
          placeholder="Saison 1: L'Éveil"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label
for="scheduled_at"
class="text-sm font-medium text-slate-300"
          >Date de début (Optionnel)</label
        >
        <Calendar
          id="scheduled_at"
          v-model="form.scheduled_at"
          show-time
          hour-format="24"
          date-format="dd/mm/yy"
          class="w-full"
          :pt="{
            input: {
              class: '!bg-slate-950 !border-slate-800 !text-white w-full',
            },
            panel: { class: 'bg-slate-900 border border-slate-800' },
          }"
        />
        <small class="text-slate-500">Laissez vide pour un lancement immédiat.</small>
      </div>

      <div class="flex items-center gap-2">
        <Checkbox v-model="form.reset_weekly" input-id="reset_weekly" binary />
        <label for="reset_weekly" class="text-sm text-slate-300 cursor-pointer">
          Réinitialisation hebdomadaire des scores
        </label>
      </div>

      <div class="flex flex-col gap-2">
        <label
for="ends_at"
class="text-sm font-medium text-slate-300"
          >Date de fin (Optionnel)</label
        >
        <Calendar
          id="ends_at"
          v-model="form.ends_at"
          show-time
          hour-format="24"
          date-format="dd/mm/yy"
          class="w-full"
          :pt="{
            input: {
              class: '!bg-slate-950 !border-slate-800 !text-white w-full',
            },
            panel: { class: 'bg-slate-900 border border-slate-800' },
          }"
        />
        <small class="text-slate-500">Laissez vide pour une durée indéterminée.</small>
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
        label="Enregistrer"
        icon="pi pi-check"
        :loading="isSubmitting"
        :disabled="!form.name.trim()"
        class="!bg-indigo-600 hover:!bg-indigo-500 !border-none"
        @click="save"
      />
    </template>
  </Dialog>
</template>
