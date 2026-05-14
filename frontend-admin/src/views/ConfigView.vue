<script setup lang="ts">
import { useAdminConfig } from '@/composables/useAdminConfig';
import ProgressSpinner from 'primevue/progressspinner';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import { ref, watch } from 'vue';

const { configQuery, updateConfig } = useAdminConfig();

const form = ref({
  globalMultiplier: 1,
  enablePurchases: true,
  enablePointContributions: true,
  maxLevel: 100,
  dailyQuestsCount: 3,
  idleCoinBaseRate: 100,
  rubberBandMultiplier: 1.5,
});

// Sync form with loaded data
watch(
  () => configQuery.data.value,
  (newData) => {
    if (newData) {
      form.value.globalMultiplier = newData.globalMultiplier ?? 1;
      form.value.enablePurchases = newData.enablePurchases ?? true;
      form.value.enablePointContributions = newData.enablePointContributions ?? true;
      form.value.maxLevel = newData.maxLevel ?? 100;
      form.value.dailyQuestsCount = newData.dailyQuestsCount ?? 3;
      form.value.idleCoinBaseRate = newData.idleCoinBaseRate ?? 100;
      form.value.rubberBandMultiplier = newData.rubberBandMultiplier ?? 1.5;
    }
  },
  { immediate: true }
);

const saveConfig = () => {
  updateConfig.mutate(form.value);
};
</script>

<template>
  <div class="space-y-6 max-w-3xl">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight text-white">Configuration du Jeu</h1>
    </div>

    <div v-if="configQuery.isLoading.value" class="flex justify-center p-8">
      <ProgressSpinner />
    </div>

    <div
      v-else-if="configQuery.isError.value"
      class="text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20"
    >
      Une erreur est survenue lors du chargement des données.
    </div>

    <div v-else class="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
      <form class="space-y-6" @submit.prevent="saveConfig">
        <div class="space-y-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-slate-300"
              >Multiplicateur Global (XP/Coins)</label
            >
            <InputNumber
              v-model="form.globalMultiplier"
              input-id="globalMultiplier"
              :min-fraction-digits="1"
              :max-fraction-digits="2"
              class="w-full sm:w-64 !bg-slate-950 !border-slate-800 !text-white"
            />
            <small class="text-slate-500"
              >Applique un bonus à tous les joueurs (ex: 1.5 = +50%)</small
            >
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-slate-300">Niveau Maximum</label>
            <InputNumber
              v-model="form.maxLevel"
              input-id="maxLevel"
              class="w-full sm:w-64 !bg-slate-950 !border-slate-800 !text-white"
            />
          </div>

          <div class="flex items-center gap-2 mt-6">
            <Checkbox v-model="form.enablePurchases" input-id="enablePurchases" binary />
            <label for="enablePurchases" class="text-slate-300"
              >Activer les achats en Robux (Boutique)</label
            >
          </div>

          <div class="flex items-center gap-2">
            <Checkbox
              v-model="form.enablePointContributions"
              input-id="enablePointContributions"
              binary
            />
            <label for="enablePointContributions" class="text-slate-300"
              >Activer les contributions de points aux guerres</label
            >
          </div>
        </div>

        <div class="pt-6 border-t border-slate-800 space-y-6">
          <h2 class="text-lg font-bold text-indigo-400">Rétention et Engagement</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-slate-300"
                >Quêtes Journalières par Joueur</label
              >
              <InputNumber
                v-model="form.dailyQuestsCount"
                :min="1"
                :max="10"
                class="w-full !bg-slate-950 !border-slate-800 !text-white"
              />
              <small class="text-slate-500"
                >Nombre de missions assignées automatiquement chaque jour.</small
              >
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-slate-300"
                >Taux de Collecte Idle (Coins/h)</label
              >
              <InputNumber
                v-model="form.idleCoinBaseRate"
                :min="0"
                class="w-full !bg-slate-950 !border-slate-800 !text-white"
              />
              <small class="text-slate-500">Montant de base généré par heure d'absence.</small>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-800 space-y-6">
          <h2 class="text-lg font-bold text-amber-400">Équilibrage Dynamique (Rubber-Banding)</h2>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-slate-300">Multiplicateur de Rattrapage</label>
            <InputNumber
              v-model="form.rubberBandMultiplier"
              :min="1"
              :max="5"
              :min-fraction-digits="1"
              :max-fraction-digits="1"
              class="w-full sm:w-64 !bg-slate-950 !border-slate-800 !text-white"
            />
            <small class="text-slate-500"
              >Bonus appliqué aux factions à la traîne (ex: 1.5 = +50% de points).</small
            >
          </div>
        </div>
        <div class="pt-4 border-t border-slate-800">
          <Button
            type="submit"
            label="Enregistrer la configuration"
            icon="pi pi-save"
            :loading="updateConfig.isPending.value"
            class="!bg-indigo-600 hover:!bg-indigo-500 !border-none"
          />
        </div>
      </form>
    </div>
  </div>
</template>
