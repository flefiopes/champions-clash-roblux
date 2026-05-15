<script setup lang="ts">
import { useAdminConfig } from '@/composables/useAdminConfig';
import ProgressSpinner from 'primevue/progressspinner';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import { ref, watch } from 'vue';
import PageHeader from '@/components/common/PageHeader.vue';
import AdminCard from '@/components/common/AdminCard.vue';
import { SettingsIcon, ZapIcon, TrendingUpIcon, ShieldCheckIcon } from 'lucide-vue-next';

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
  <div class="space-y-8 max-w-4xl">
    <PageHeader
      title="Configuration du Jeu"
      subtitle="Paramètres critiques de l'économie, de la progression et de l'équilibrage en temps réel."
    >
      <template #icon>
        <SettingsIcon class="text-indigo-400" />
      </template>
    </PageHeader>

    <div v-if="configQuery.isLoading.value" class="flex justify-center p-12">
      <ProgressSpinner />
    </div>

    <div
      v-else-if="configQuery.isError.value"
      class="text-red-400 p-6 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-lg"
    >
      Une erreur est survenue lors du chargement de la configuration globale.
    </div>

    <div v-else class="space-y-8">
      <form class="space-y-8" @submit.prevent="saveConfig">
        <!-- Section: Core Economy -->
        <AdminCard title="Économie & Progression">
          <div class="grid gap-8 md:grid-cols-2">
            <div class="flex flex-col gap-3">
              <label
                class="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"
              >
                <ZapIcon :size="14" class="text-amber-400" />
                Multiplicateur Global
              </label>
              <InputNumber
                v-model="form.globalMultiplier"
                input-id="globalMultiplier"
                :min-fraction-digits="1"
                :max-fraction-digits="2"
                class="w-full !bg-slate-950 !border-slate-800 !text-white !rounded-xl"
              />
              <p class="text-xs text-slate-500 font-medium leading-relaxed">
                Applique un bonus multiplicateur à tous les gains d'XP et de Coins (ex: 1.5 = +50%).
              </p>
            </div>

            <div class="flex flex-col gap-3">
              <label
                class="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"
              >
                <TrendingUpIcon :size="14" class="text-indigo-400" />
                Niveau Maximum
              </label>
              <InputNumber
                v-model="form.maxLevel"
                input-id="maxLevel"
                class="w-full !bg-slate-950 !border-slate-800 !text-white !rounded-xl"
              />
              <p class="text-xs text-slate-500 font-medium leading-relaxed">
                Limite supérieure de la progression des personnages pour cette saison.
              </p>
            </div>
          </div>

          <div class="grid gap-6 md:grid-cols-2 mt-8 pt-8 border-t border-slate-800/50">
            <div
              class="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-indigo-500/30 transition-colors"
            >
              <Checkbox
                v-model="form.enablePurchases"
                input-id="enablePurchases"
                binary
                class="!w-6 !h-6"
              />
              <div class="flex flex-col">
                <label
for="enablePurchases"
class="text-sm font-bold text-white tracking-tight"
                  >Activer la Boutique</label
                >
                <span class="text-[10px] text-slate-500 font-medium"
                  >Autorise les transactions Robux en jeu.</span
                >
              </div>
            </div>

            <div
              class="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-indigo-500/30 transition-colors"
            >
              <Checkbox
                v-model="form.enablePointContributions"
                input-id="enablePointContributions"
                binary
                class="!w-6 !h-6"
              />
              <div class="flex flex-col">
                <label
                  for="enablePointContributions"
                  class="text-sm font-bold text-white tracking-tight"
                  >Flux de Points</label
                >
                <span class="text-[10px] text-slate-500 font-medium"
                  >Active la contribution aux scores de faction.</span
                >
              </div>
            </div>
          </div>
        </AdminCard>

        <!-- Section: Engagement -->
        <AdminCard title="Rétention & Engagement">
          <div class="grid gap-8 md:grid-cols-2">
            <div class="flex flex-col gap-3">
              <label class="text-sm font-black text-slate-400 uppercase tracking-widest"
                >Quêtes / Jour</label
              >
              <InputNumber
                v-model="form.dailyQuestsCount"
                :min="1"
                :max="10"
                class="w-full !bg-slate-950 !border-slate-800 !text-white !rounded-xl"
              />
              <p class="text-xs text-slate-500 font-medium">
                Nombre de missions assignées automatiquement à chaque reset.
              </p>
            </div>

            <div class="flex flex-col gap-3">
              <label class="text-sm font-black text-slate-400 uppercase tracking-widest"
                >Base Idle (Coins/h)</label
              >
              <InputNumber
                v-model="form.idleCoinBaseRate"
                :min="0"
                class="w-full !bg-slate-950 !border-slate-800 !text-white !rounded-xl"
              />
              <p class="text-xs text-slate-500 font-medium">
                Récompense passive générée pour les joueurs hors-ligne.
              </p>
            </div>
          </div>
        </AdminCard>

        <!-- Section: Balancing -->
        <AdminCard title="Équilibrage Dynamique">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <ShieldCheckIcon :size="20" />
              </div>
              <label class="text-sm font-black text-slate-300 uppercase tracking-widest"
                >Multiplicateur de Rattrapage</label
              >
            </div>
            <InputNumber
              v-model="form.rubberBandMultiplier"
              :min="1"
              :max="5"
              :min-fraction-digits="1"
              :max-fraction-digits="1"
              class="w-full md:w-1/2 !bg-slate-950 !border-slate-800 !text-white !rounded-xl"
            />
            <p class="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
              Le système de "Rubber-Banding" applique ce bonus aux factions ayant un retard
              significatif pour maintenir l'engagement et la compétition (ex: 1.5 = +50% de points
              générés).
            </p>
          </div>
        </AdminCard>

        <!-- Action Button -->
        <div
          class="flex items-center justify-end p-8 bg-slate-900/50 rounded-3xl border border-slate-800/50 backdrop-blur-xl"
        >
          <Button
            type="submit"
            label="Déployer la Configuration"
            icon="pi pi-save"
            :loading="updateConfig.isPending.value"
            class="!bg-indigo-600 hover:!bg-indigo-500 !border-none !px-8 !py-3 !rounded-xl !font-black !tracking-widest !text-xs !shadow-lg shadow-indigo-600/20"
          />
        </div>
      </form>
    </div>
  </div>
</template>
