<script setup lang="ts">
import { useAdminMinigames } from '@/composables/useAdminMinigames';
import { useAdminConfig } from '@/composables/useAdminConfig';
import ProgressSpinner from 'primevue/progressspinner';
import ToggleSwitch from 'primevue/toggleswitch';
import { Gamepad2, Coins, Activity } from 'lucide-vue-next';

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
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-white">Vision des Mini-Jeux</h1>
        <p class="text-slate-400">Statut en temps réel et performance globale.</p>
      </div>
      <Button
        label="Ajouter un Mini-jeu"
        icon="pi pi-plus"
        class="p-button-sm !bg-indigo-600 !border-indigo-600"
        @click="isAddModalOpen = true"
      />
    </div>

    <div
      v-if="configQuery.isLoading.value || minigamesQuery.isLoading.value"
      class="flex justify-center p-8"
    >
      <ProgressSpinner />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(settings, gameId) in configQuery.data.value?.minigames"
        :key="gameId"
        class="group relative rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10"
      >
        <div class="flex items-start justify-between mb-4">
          <div
            class="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform"
          >
            <Gamepad2 :size="24" />
          </div>
          <ToggleSwitch
            :model-value="settings.enabled"
            @update:model-value="toggleMinigame(gameId, settings)"
          />
        </div>

        <h3 class="text-xl font-bold text-white capitalize mb-1">
          {{ gameId }}
        </h3>

        <div class="flex items-center gap-2 mb-6">
          <span class="text-xs text-slate-500 uppercase font-bold tracking-wider"
            >Limite Points:</span
          >
          <InputNumber
            :model-value="settings.max_reward"
            class="w-20 p-inputtext-sm"
            :min="0"
            :max="10000"
            @update:model-value="(val) => updateMaxReward(gameId, settings, val || 0)"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div class="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Activity :size="14" />
              Parties
            </div>
            <div class="text-lg font-bold text-white">
              {{ getGameStats(gameId).totalRuns }}
            </div>
          </div>
          <div class="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div class="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Coins :size="14" />
              Coins
            </div>
            <div class="text-lg font-bold text-indigo-400">
              {{ getGameStats(gameId).totalCoins }}
            </div>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-between text-xs">
          <span
            :class="settings.enabled ? 'text-green-400' : 'text-red-400'"
            class="flex items-center gap-1 font-medium"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="settings.enabled ? 'bg-green-400' : 'bg-red-400'"
            ></span>
            {{ settings.enabled ? 'Actif' : 'Désactivé' }}
          </span>
          <span class="text-slate-500">Dernière mise à jour: Aujourd'hui</span>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout -->
    <Dialog
      v-model:visible="isAddModalOpen"
      modal
      header="Nouveau Mini-jeu"
      :style="{ width: '350px' }"
    >
      <div class="space-y-4 pt-4">
        <div class="flex flex-col gap-2">
          <label for="game-id" class="text-sm font-medium text-slate-300"
            >Identifiant (Roblox)</label
          >
          <InputText
            id="game-id"
            v-model="newGame.id"
            placeholder="ex: race, combat..."
            class="w-full"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="max-reward" class="text-sm font-medium text-slate-300"
            >Points Max (Anti-Cheat)</label
          >
          <InputNumber id="max-reward" v-model="newGame.max_reward" class="w-full" :min="10" />
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <Button
            label="Annuler"
            class="p-button-text !text-slate-400"
            @click="isAddModalOpen = false"
          />
          <Button
            label="Créer"
            class="!bg-indigo-600 !border-indigo-600"
            :disabled="!newGame.id"
            @click="addMinigame"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
