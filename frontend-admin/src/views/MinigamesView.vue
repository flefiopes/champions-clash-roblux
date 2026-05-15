<script setup lang="ts">
import { useAdminMinigames } from '@/composables/useAdminMinigames';
import { useAdminConfig } from '@/composables/useAdminConfig';
import ProgressSpinner from 'primevue/progressspinner';
import ToggleSwitch from 'primevue/toggleswitch';
import { Gamepad2Icon, CoinsIcon, ActivityIcon } from 'lucide-vue-next';
import PageHeader from '@/components/common/PageHeader.vue';

import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';

const { minigamesQuery } = useAdminMinigames();
const { configQuery, updateConfig } = useAdminConfig();

const isAddModalOpen = ref(false);
const newGame = ref({ id: '', max_reward: 200 });

const toggleMinigame = async (
  gameId: string,
  current: { enabled: boolean; max_reward: number }
) => {
  const newMinigames = { ...configQuery.data.value?.minigames };
  newMinigames[gameId] = { ...current, enabled: !current.enabled };
  await updateConfig.mutateAsync({ minigames: newMinigames });
};

const updateMaxReward = async (
  gameId: string,
  current: { enabled: boolean; max_reward: number },
  newValue: number
) => {
  const newMinigames = { ...configQuery.data.value?.minigames };
  newMinigames[gameId] = { ...current, max_reward: newValue };
  await updateConfig.mutateAsync({ minigames: newMinigames });
};

const addMinigame = async () => {
  if (!newGame.value.id) return;
  const newMinigames = { ...configQuery.data.value?.minigames };
  newMinigames[newGame.value.id.toLowerCase()] = {
    enabled: true,
    max_reward: newGame.value.max_reward,
  };
  await updateConfig.mutateAsync({ minigames: newMinigames });
  isAddModalOpen.value = false;
  newGame.value = { id: '', max_reward: 200 };
};

const getGameStats = (gameId: string) => {
  return (
    minigamesQuery.data.value?.find((s) => s.minigameId === gameId) || {
      totalRuns: 0,
      totalCoins: 0,
    }
  );
};
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Vision des Mini-Jeux"
      subtitle="Statut en temps réel, limites de récompenses et performance globale par module."
      button-label="Nouveau Module"
      button-icon="pi pi-plus"
      @action="isAddModalOpen = true"
    >
      <template #icon>
        <Gamepad2Icon class="text-indigo-400" />
      </template>
    </PageHeader>

    <div
      v-if="configQuery.isLoading.value || minigamesQuery.isLoading.value"
      class="flex justify-center p-12"
    >
      <ProgressSpinner />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="(settings, gameId) in configQuery.data.value?.minigames"
        :key="gameId"
        class="group relative rounded-3xl border border-slate-800 bg-slate-900 p-8 transition-all hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden"
      >
        <div
          class="absolute -right-12 -top-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"
        ></div>

        <div class="flex items-start justify-between mb-6 relative">
          <div
            class="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/5"
          >
            <Gamepad2Icon :size="28" />
          </div>
          <ToggleSwitch
            :model-value="settings.enabled"
            @update:model-value="toggleMinigame(gameId, settings)"
          />
        </div>

        <h3 class="text-2xl font-black text-white capitalize mb-2 tracking-tight">
          {{ gameId }}
        </h3>

        <div class="flex items-center gap-3 mb-8">
          <span class="text-[10px] text-slate-500 uppercase font-black tracking-widest"
            >Anti-Cheat Cap:</span
          >
          <InputNumber
            :model-value="settings.max_reward"
            class="w-24"
            :min="0"
            :max="10000"
            :pt="{
              input: {
                class: '!bg-slate-950 !border-slate-800 !text-white !font-bold !text-xs !py-1',
              },
            }"
            @update:model-value="(val) => updateMaxReward(gameId, settings, val || 0)"
          />
        </div>

        <div class="grid grid-cols-2 gap-4 relative">
          <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800/50 flex flex-col gap-1">
            <div
              class="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-wider"
            >
              <ActivityIcon :size="12" class="text-indigo-400" />
              Runs
            </div>
            <div class="text-xl font-black text-white font-mono">
              {{ getGameStats(gameId).totalRuns }}
            </div>
          </div>
          <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800/50 flex flex-col gap-1">
            <div
              class="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-wider"
            >
              <CoinsIcon :size="12" class="text-amber-400" />
              Coins
            </div>
            <div class="text-xl font-black text-amber-400 font-mono">
              {{ getGameStats(gameId).totalCoins }}
            </div>
          </div>
        </div>

        <div
          class="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-widest relative"
        >
          <span
            :class="settings.enabled ? 'text-emerald-400' : 'text-rose-400'"
            class="flex items-center gap-2"
          >
            <span
              class="w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor]"
              :class="settings.enabled ? 'bg-emerald-400' : 'bg-rose-400'"
            ></span>
            {{ settings.enabled ? 'Système Actif' : 'Désactivé' }}
          </span>
          <span class="text-slate-600 font-mono tracking-tighter">Live Monitor</span>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout -->
    <Dialog
      v-model:visible="isAddModalOpen"
      modal
      header="Nouveau Mini-jeu"
      :style="{ width: '30rem' }"
      :pt="{
        root: { class: 'bg-slate-900 border border-slate-800 rounded-3xl' },
        header: { class: 'bg-slate-900 border-b border-slate-800 text-white font-black' },
        content: { class: 'bg-slate-900 pt-8' },
        footer: { class: 'bg-slate-900 border-t border-slate-800' },
      }"
    >
      <div class="space-y-6">
        <div class="flex flex-col gap-2">
          <label
for="game-id"
class="text-xs font-black text-slate-500 uppercase tracking-widest"
            >Identifiant (Roblox)</label
          >
          <InputText
            id="game-id"
            v-model="newGame.id"
            placeholder="ex: race, combat..."
            class="w-full !bg-slate-950 !border-slate-800 !text-white !rounded-xl"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label
            for="max-reward"
            class="text-xs font-black text-slate-500 uppercase tracking-widest"
            >Récompense Max (Anti-Cheat)</label
          >
          <InputNumber
            id="max-reward"
            v-model="newGame.max_reward"
            class="w-full"
            :min="10"
            :pt="{
              input: { class: '!bg-slate-950 !border-slate-800 !text-white !rounded-xl' },
            }"
          />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <Button
            label="Annuler"
            text
            severity="secondary"
            class="!text-slate-500 hover:!text-white"
            @click="isAddModalOpen = false"
          />
          <Button
            label="Enregistrer le Module"
            icon="pi pi-check"
            class="!bg-indigo-600 hover:!bg-indigo-500 !border-none !rounded-xl !px-6"
            :disabled="!newGame.id"
            @click="addMinigame"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
