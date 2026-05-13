<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import { useAdminFactions } from '@/composables/useAdminFactions';
import { useAdminWars } from '@/composables/useAdminWars';
import type { Faction, CreateFactionDto, UpdateFactionDto } from '@/types/admin.types';

const props = defineProps<{
  visible: boolean;
  faction: Faction | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const { createFaction, updateFaction } = useAdminFactions();
const { warsQuery } = useAdminWars();

const form = ref({
  war_id: '',
  name: '',
  color_hex: '#FFFFFF',
  slogan: '',
});

// Options for Dropdown
const warOptions = computed(() => {
  if (!warsQuery.data.value) return [];
  return warsQuery.data.value.map(w => ({ label: w.name, value: w.id }));
});

watch(
  () => props.faction,
  (newFaction) => {
    if (newFaction) {
      form.value = {
        war_id: newFaction.warId,
        name: newFaction.name,
        color_hex: newFaction.colorHex,
        slogan: newFaction.slogan,
      };
    } else {
      form.value = {
        war_id: '',
        name: '',
        color_hex: '#FFFFFF',
        slogan: '',
      };
    }
  },
  { immediate: true }
);

const isSubmitting = ref(false);

const close = () => {
  emit('update:visible', false);
};

const isValidHex = (hex: string) => /^#[0-9A-Fa-f]{6}$/.test(hex);

const isValid = computed(() => {
  if (!form.value.name.trim() || !form.value.slogan.trim()) return false;
  if (!isValidHex(form.value.color_hex)) return false;
  if (!props.faction && !form.value.war_id) return false;
  return true;
});

const save = async () => {
  if (!isValid.value) return;
  
  isSubmitting.value = true;
  
  try {
    if (props.faction) {
      // Edit - war_id cannot be changed according to backend schema UpdateFactionSchema
      const dto: UpdateFactionDto = {
        name: form.value.name,
        color_hex: form.value.color_hex,
        slogan: form.value.slogan,
      };
      await updateFaction.mutateAsync({ id: props.faction.id, data: dto });
    } else {
      // Create
      const dto: CreateFactionDto = {
        war_id: form.value.war_id,
        name: form.value.name,
        color_hex: form.value.color_hex,
        slogan: form.value.slogan,
      };
      await createFaction.mutateAsync(dto);
    }
    close();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    modal
    :header="faction ? 'Modifier la faction' : 'Créer une nouvelle faction'"
    :style="{ width: '32rem' }"
    :pt="{
      root: { class: 'bg-slate-900 border border-slate-800' },
      header: { class: 'bg-slate-900 border-b border-slate-800 text-white' },
      content: { class: 'bg-slate-900 pt-6' },
      footer: { class: 'bg-slate-900 border-t border-slate-800' }
    }"
  >
    <div class="flex flex-col gap-6">
      
      <!-- War Selection (Only visible during creation) -->
      <div v-if="!faction" class="flex flex-col gap-2">
        <label for="war_id" class="text-sm font-medium text-slate-300">Guerre associée</label>
        <Dropdown
          id="war_id"
          v-model="form.war_id"
          :options="warOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Sélectionnez une guerre"
          class="w-full"
          :pt="{
            root: { class: '!bg-slate-950 !border-slate-800' },
            input: { class: '!text-white' },
            panel: { class: '!bg-slate-900 !border-slate-800' },
            item: { class: '!text-slate-300 hover:!bg-slate-800' }
          }"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="name" class="text-sm font-medium text-slate-300">Nom de la faction</label>
        <InputText
          id="name"
          v-model="form.name"
          autocomplete="off"
          class="!bg-slate-950 !border-slate-800 !text-white"
          placeholder="Ex: Les Ombres"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="slogan" class="text-sm font-medium text-slate-300">Slogan (Cri de guerre)</label>
        <InputText
          id="slogan"
          v-model="form.slogan"
          autocomplete="off"
          class="!bg-slate-950 !border-slate-800 !text-white"
          placeholder="Ex: La nuit nous appartient !"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="color_hex" class="text-sm font-medium text-slate-300">Couleur (Code Hex)</label>
        <div class="flex items-center gap-3">
          <InputText
            id="color_hex"
            v-model="form.color_hex"
            autocomplete="off"
            class="!bg-slate-950 !border-slate-800 !text-white flex-1"
            placeholder="#DC143C"
          />
          <div 
            class="h-10 w-10 rounded-md border border-slate-700 shadow-inner flex-shrink-0"
            :style="{ backgroundColor: isValidHex(form.color_hex) ? form.color_hex : 'transparent' }"
          ></div>
        </div>
        <small v-if="!isValidHex(form.color_hex)" class="text-red-400">Format invalide. Exemple: #DC143C</small>
      </div>

    </div>

    <template #footer>
      <Button
        label="Annuler"
        icon="pi pi-times"
        text
        severity="secondary"
        @click="close"
        class="!text-slate-400 hover:!text-white"
      />
      <Button
        label="Enregistrer"
        icon="pi pi-check"
        @click="save"
        :loading="isSubmitting"
        :disabled="!isValid"
        class="!bg-indigo-600 hover:!bg-indigo-500 !border-none"
      />
    </template>
  </Dialog>
</template>
