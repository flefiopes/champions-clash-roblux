<script setup lang="ts">
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import { useAdminBadges } from '@/composables/useAdminRewards';

import type { Quest, CreateQuestDto } from '@/types/admin.types';

const props = defineProps<{
  visible: boolean;
  quest?: Quest | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'save', data: CreateQuestDto): void;
}>();

const { badgesQuery } = useAdminBadges();

const questTypes = [
  { label: 'Journalière', value: 'daily' },
  { label: 'Recrutement', value: 'recruit' },
  { label: 'Saisonnière', value: 'seasonal' },
  { label: 'Secrète', value: 'secret' },
];

const requirementTypes = [
  { label: 'Pièces gagnées', value: 'coins_earned' },
  { label: 'XP gagné', value: 'xp_earned' },
  { label: 'Points contribués', value: 'points_contributed' },
  { label: 'Jeux joués', value: 'games_played' },
  { label: 'Factions rejointes', value: 'faction_join' },
];

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const formData = ref<any>({
  type: 'daily',
  title: '',
  description: '',
  requirement_type: 'coins_earned',
  requirement_value: 100,
  reward_coins: 0,
  reward_gems: 0,
  reward_xp: 0,
  reward_badge_id: null,
  expires_at: null,
});

watch(
  () => props.quest,
  (val) => {
    if (val) {
      formData.value = {
        type: val.type,
        title: val.title,
        description: val.description,
        requirement_type: val.requirementType,
        requirement_value: val.requirementValue,
        reward_coins: val.rewardCoins,
        reward_gems: val.rewardGems,
        reward_xp: val.rewardXp,
        reward_badge_id: val.rewardBadgeId,
        expires_at: val.expiresAt ? new Date(val.expiresAt) : null,
      } as unknown as Quest;
    } else {
      formData.value = {
        type: 'daily',
        title: '',
        description: '',
        requirement_type: 'coins_earned',
        requirement_value: 100,
        reward_coins: 0,
        reward_gems: 0,
        reward_xp: 0,
        reward_badge_id: null,
        expires_at: null,
      };
    }
  },
  { immediate: true }
);

const onSave = () => {
  const payload: CreateQuestDto = {
    ...(formData.value as unknown as CreateQuestDto),
    expires_at: formData.value.expires_at
      ? (formData.value.expires_at as Date).toISOString()
      : null,
  };
  emit('save', payload);
};
</script>

<template>
  <Dialog
    :visible="props.visible"
    :header="props.quest ? 'Modifier la Quête' : 'Nouvelle Quête'"
    modal
    class="w-full max-w-xl mx-4"
    :draggable="false"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="flex flex-col gap-6 py-4 overflow-x-hidden">
      <!-- Section: Général -->
      <div class="space-y-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
            >Titre de la mission</label
          >
          <InputText v-model="formData.title" placeholder="Titre..." fluid />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
            >Description</label
          >
          <Textarea
            v-model="formData.description"
            rows="2"
            placeholder="Description..."
            fluid
            class="resize-none"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >Catégorie</label
            >
            <Select
              v-model="formData.type"
              :options="questTypes"
              option-label="label"
              option-value="value"
              fluid
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >Expiration</label
            >
            <DatePicker
              v-model="formData.expires_at"
              show-time
              hour-format="24"
              placeholder="Illimitée"
              fluid
            />
          </div>
        </div>
      </div>

      <div class="h-px bg-slate-800"></div>

      <!-- Section: Objectif -->
      <div class="space-y-4">
        <h3 class="text-xs font-black text-amber-500 uppercase tracking-wider">Objectifs</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >Type d'objectif</label
            >
            <Select
              v-model="formData.requirement_type"
              :options="requirementTypes"
              option-label="label"
              option-value="value"
              fluid
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >Valeur requise</label
            >
            <InputNumber v-model="formData.requirement_value" :min="1" fluid />
          </div>
        </div>
      </div>

      <div class="h-px bg-slate-800"></div>

      <!-- Section: Butin -->
      <div class="space-y-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
        <h3 class="text-xs font-black text-emerald-400 uppercase tracking-wider">
          Butin & Récompenses
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold text-slate-500 uppercase">Pièces</label>
            <InputNumber v-model="formData.reward_coins" :min="0" fluid />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold text-slate-500 uppercase">Expérience (XP)</label>
            <InputNumber v-model="formData.reward_xp" :min="0" fluid />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold text-slate-500 uppercase">Gemmes</label>
            <InputNumber v-model="formData.reward_gems" :min="0" fluid />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold text-slate-500 uppercase">Badge Bonus</label>
            <Select
              v-model="formData.reward_badge_id"
              :options="badgesQuery.data.value || []"
              option-label="name"
              option-value="id"
              placeholder="Aucun"
              show-clear
              fluid
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
        <Button
          label="Annuler"
          text
          class="!text-slate-500"
          @click="emit('update:visible', false)"
        />
        <Button
          :label="props.quest ? 'Sauvegarder' : 'Créer'"
          :loading="props.loading"
          class="!bg-indigo-600 hover:!bg-indigo-500 !border-none !px-8"
          @click="onSave"
        />
      </div>
    </template>
  </Dialog>
</template>
