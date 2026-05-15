<script setup lang="ts">
/**
 * LeaderboardView component.
 * Displays global rankings for both Factions (collective) and Players (individual).
 *
 * @module views/LeaderboardView
 */

import { useAdminLeaderboard } from '@/composables/useAdminLeaderboard';
import { useAdminFactions } from '@/composables/useAdminFactions';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import PageHeader from '@/components/common/PageHeader.vue';
import AdminCard from '@/components/common/AdminCard.vue';
import { TrophyIcon, UsersIcon, StarIcon, CoinsIcon, ShieldIcon } from 'lucide-vue-next';

const { playersLeaderboardQuery } = useAdminLeaderboard();
const { factionsQuery } = useAdminFactions();

/**
 * Format large numbers for display.
 */
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

/**
 * Get color for rank tag.
 */
const getRankSeverity = (rank: string) => {
  switch (rank.toLowerCase()) {
    case 'legend':
      return 'warn';
    case 'champion':
      return 'success';
    case 'elite':
      return 'info';
    case 'veteran':
      return 'secondary';
    default:
      return undefined;
  }
};
</script>

<template>
  <div class="space-y-12">
    <PageHeader
      title="Classements Mondiaux"
      subtitle="Suivi en temps réel de la compétition entre les factions et du prestige individuel."
    >
      <template #icon>
        <TrophyIcon class="text-amber-400" />
      </template>
    </PageHeader>

    <!-- Factions Leaderboard -->
    <section class="space-y-6">
      <div class="flex items-center gap-3 text-xl font-black text-white px-2">
        <div class="p-2 bg-indigo-500/20 rounded-lg">
          <UsersIcon :size="20" class="text-indigo-400" />
        </div>
        <h2>Suprématie des Factions</h2>
      </div>

      <div v-if="factionsQuery.isLoading.value" class="flex justify-center p-12">
        <ProgressSpinner />
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="(faction, index) in factionsQuery.data.value
            ?.slice()
            .sort((a, b) => b.totalPoints - a.totalPoints)"
          :key="faction.id"
          class="relative rounded-3xl border border-slate-800 bg-slate-900 p-8 overflow-hidden transition-all hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 group"
        >
          <!-- Rank Badge -->
          <div
            class="absolute -right-4 -top-4 w-20 h-20 flex items-center justify-center font-black text-4xl italic opacity-10 group-hover:opacity-20 transition-opacity"
            :class="
              index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-400' : 'text-orange-600'
            "
          >
            #{{ index + 1 }}
          </div>

          <div class="flex items-center gap-5">
            <div
              class="w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-700 shadow-xl"
              :style="{
                backgroundColor: faction.colorHex + '15',
                color: faction.colorHex,
                borderColor: faction.colorHex + '30',
              }"
            >
              <ShieldIcon :size="32" />
            </div>
            <div>
              <h3 class="text-xl font-black text-white leading-tight">{{ faction.name }}</h3>
              <p class="text-xs text-slate-500 italic mt-1 font-medium">"{{ faction.slogan }}"</p>
            </div>
          </div>

          <div class="mt-8 flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]"
                >Score de Guerre</span
              >
              <span
class="text-xs font-bold"
:style="{ color: faction.colorHex }"
                >{{ formatNumber(faction.totalPoints) }} PTS</span
              >
            </div>
            <div
              class="w-full h-3 bg-slate-950 rounded-full mt-2 overflow-hidden border border-slate-800 p-0.5"
            >
              <div
                class="h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                :style="{
                  backgroundColor: faction.colorHex,
                  width: '65%',
                  boxShadow: `0 0 20px ${faction.colorHex}40`,
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Players Leaderboard -->
    <section class="space-y-6">
      <div class="flex items-center gap-3 text-xl font-black text-white px-2">
        <div class="p-2 bg-amber-500/20 rounded-lg">
          <StarIcon :size="20" class="text-amber-400" />
        </div>
        <h2>Elite des Joueurs</h2>
      </div>

      <div v-if="playersLeaderboardQuery.isLoading.value" class="flex justify-center p-12">
        <ProgressSpinner />
      </div>

      <AdminCard v-else no-padding>
        <DataTable
          :value="playersLeaderboardQuery.data.value || []"
          paginator
          :rows="20"
          data-key="id"
          class="p-datatable-sm w-full"
          row-hover
        >
          <template #empty>
            <div class="p-12 text-center text-slate-500 font-medium italic">
              Aucun champion détecté dans cette dimension.
            </div>
          </template>

          <Column header="#" style="width: 4rem">
            <template #body="{ index }">
              <div
                class="flex items-center justify-center w-8 h-8 rounded-lg font-black italic"
                :class="
                  index === 0
                    ? 'bg-amber-400/10 text-amber-400'
                    : index === 1
                      ? 'bg-slate-400/10 text-slate-300'
                      : index === 2
                        ? 'bg-orange-600/10 text-orange-500'
                        : 'text-slate-600'
                "
              >
                {{ index + 1 }}
              </div>
            </template>
          </Column>

          <Column field="pseudo" header="Guerrier" sortable>
            <template #body="{ data }">
              <div class="flex flex-col">
                <span class="font-black text-white text-base tracking-tight">{{
                  data.pseudo
                }}</span>
                <span class="text-[9px] text-slate-600 font-mono tracking-tighter uppercase">{{
                  data.id
                }}</span>
              </div>
            </template>
          </Column>

          <Column field="rank" header="Rang" sortable>
            <template #body="{ data }">
              <Tag
                :value="data.rank"
                :severity="getRankSeverity(data.rank)"
                class="uppercase text-[9px] font-black tracking-widest px-3"
              />
            </template>
          </Column>

          <Column field="prestigeLevel" header="Prestige" sortable>
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <TrophyIcon :size="14" class="text-amber-400" />
                <span class="font-black text-white">{{ data.prestigeLevel }}</span>
              </div>
            </template>
          </Column>

          <Column field="xp" header="XP" sortable>
            <template #body="{ data }">
              <span class="font-mono text-slate-400 font-bold">{{ formatNumber(data.xp) }}</span>
            </template>
          </Column>

          <Column field="coins" header="Fortune" sortable>
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <CoinsIcon :size="14" class="text-amber-500" />
                <span class="text-slate-200 font-black">{{ formatNumber(data.coins) }}</span>
              </div>
            </template>
          </Column>
        </DataTable>
      </AdminCard>
    </section>
  </div>
</template>
