<script setup lang="ts">
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';

import type { Badge, CreateBadgeDto } from '@/types/admin.types';

const props = defineProps<{
  visible: boolean;
  badge?: Badge | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'save', data: CreateBadgeDto): void;
}>();

const rarities = [
  { label: 'Commune', value: 'common' },
  { label: 'Rare', value: 'rare' },
  { label: 'Épique', value: 'epic' },
  { label: 'Légendaire', value: 'legendary' },
  { label: 'Secrète', value: 'secret' },
];

const formData = ref({
  slug: '',
  name: '',
  description: '',
  image_url: '',
  rarity: 'common',
  is_permanent: true,
});

watch(
  () => props.badge,
  (val) => {
    if (val) {
      formData.value = {
        slug: val.slug,
        name: val.name,
        description: val.description,
        image_url: val.imageUrl,
        rarity: val.rarity,
        is_permanent: val.isPermanent,
      };
    } else {
      formData.value = {
        slug: '',
        name: '',
        description: '',
        image_url: '',
        rarity: 'common',
        is_permanent: true,
      };
    }
  },
  { immediate: true }
);

const onSave = () => {
  emit('save', { ...formData.value } as unknown as CreateBadgeDto);
};
</script>

<template>
  <Dialog
    :visible="props.visible"
    :header="props.badge ? 'Modifier le Badge' : 'Nouveau Badge'"
    modal
    class="w-full max-w-lg"
    :draggable="false"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="space-y-5 py-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom</label>
          <InputText v-model="formData.name" placeholder="Ex: Grand Maître" class="w-full" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Slug</label>
          <InputText
            v-model="formData.slug"
            placeholder="ex: grand-maitre"
            class="w-full"
            :disabled="!!props.badge"
          />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
        <Textarea
          v-model="formData.description"
          rows="2"
          placeholder="Description du succès..."
          class="w-full"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider"
          >URL de l'image</label
        >
        <InputText v-model="formData.image_url" placeholder="https://..." class="w-full" />
      </div>

      <div
        class="flex items-center justify-between gap-6 p-4 rounded-xl bg-slate-950 border border-slate-800"
      >
        <div class="flex flex-col gap-2 flex-1">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Rareté</label>
          <Select
            v-model="formData.rarity"
            :options="rarities"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </div>

        <div class="flex items-center gap-2 mt-6">
          <Checkbox v-model="formData.is_permanent" binary input-id="is_permanent" />
          <label for="is_permanent" class="text-sm text-slate-300">Permanent</label>
        </div>
      </div>

      <!-- Preview -->
      <div
        v-if="formData.image_url"
        class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-800"
      >
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aperçu</span>
        <div
          class="w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden"
        >
          <img :src="formData.image_url" alt="Preview" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3 pt-4">
        <Button
          label="Annuler"
          text
          class="!text-slate-400"
          @click="emit('update:visible', false)"
        />
        <Button
          :label="props.badge ? 'Mettre à jour' : 'Créer le Badge'"
          :loading="props.loading"
          class="!bg-indigo-600 !border-indigo-600"
          @click="onSave"
        />
      </div>
    </template>
  </Dialog>
</template>
