<script setup lang="ts">
import { useAdminStats, useAdminActivity } from '@/composables/use-admin-stats';
import PageHeader from '@/components/common/PageHeader.vue';
import AdminStatsCard from '@/components/common/AdminStatsCard.vue';
import AdminCard from '@/components/common/AdminCard.vue';
import {
  UsersIcon,
  SwordsIcon,
  ShieldIcon,
  FlagIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  CoinsIcon,
  AwardIcon,
  ZapIcon,
  TrendingUpIcon,
} from 'lucide-vue-next';
import ProgressSpinner from 'primevue/progressspinner';

const { data: stats, isLoading, isError } = useAdminStats();
const activityQuery = useAdminActivity();
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Dashboard Overview"
      subtitle="Statistiques globales et monitoring de l'activité plateforme."
    >
      <template #icon>
        <LayoutDashboardIcon class="text-indigo-400" />
      </template>
    </PageHeader>

    <!-- Error State -->
    <div
      v-if="isError"
      class="rounded-xl bg-red-500/10 p-6 text-red-400 border border-red-500/20 shadow-lg shadow-red-500/5"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 bg-red-500/20 rounded-lg">
          <FlagIcon :size="20" />
        </div>
        <div>
          <h3 class="font-bold">Erreur de chargement</h3>
          <p class="text-sm opacity-80">
            Impossible de récupérer les statistiques du tableau de bord.
          </p>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <AdminStatsCard
        label="Joueurs Totaux"
        :value="stats?.totalPlayers || 0"
        :icon="UsersIcon"
        icon-bg-class="bg-indigo-500/10"
        icon-color-class="text-indigo-400"
        :is-loading="isLoading"
      />
      <AdminStatsCard
        label="Guerres Totales"
        :value="stats?.totalWars || 0"
        :icon="SwordsIcon"
        icon-bg-class="bg-red-500/10"
        icon-color-class="text-red-400"
        :is-loading="isLoading"
      />
      <AdminStatsCard
        label="Guerres Actives"
        :value="stats?.activeWars || 0"
        :icon="ShieldIcon"
        icon-bg-class="bg-amber-500/10"
        icon-color-class="text-amber-400"
        :is-loading="isLoading"
      />
      <AdminStatsCard
        label="Factions"
        :value="stats?.totalFactions || 0"
        :icon="FlagIcon"
        icon-bg-class="bg-emerald-500/10"
        icon-color-class="text-emerald-400"
        :is-loading="isLoading"
      />
    </div>

    <div class="grid gap-8 lg:grid-cols-3">
      <!-- Activity Section (Quests + Transactions) -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Recent Quest Completions -->
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-lg font-bold text-white px-2">
            <ScrollTextIcon :size="20" class="text-indigo-400" />
            <h2>Quêtes Récemment Complétées</h2>
          </div>

          <AdminCard no-padding>
            <div v-if="activityQuery.isLoading.value" class="p-12 flex justify-center">
              <ProgressSpinner />
            </div>
            <div v-else class="p-4 space-y-4">
              <div
                v-for="quest in activityQuery.data.value?.recentQuests || []"
                :key="quest.id"
                class="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-indigo-500/30 transition-all"
              >
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-white">{{ quest.pseudo }}</span>
                  <span class="text-[10px] text-slate-500 font-mono tracking-tighter">{{
                    quest.id
                  }}</span>
                </div>
                <div class="text-right">
                  <div class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    Terminée
                  </div>
                  <div class="text-[10px] text-slate-600 font-mono">
                    {{ new Date(quest.completedAt).toLocaleTimeString() }}
                  </div>
                </div>
              </div>
              <div
                v-if="!activityQuery.data.value?.recentQuests?.length && !activityQuery.isLoading.value"
                class="text-center py-12 text-slate-600 text-sm italic"
              >
                Aucune activité récente détectée.
              </div>
            </div>
          </AdminCard>
        </div>

        <!-- Recent Transactions -->
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-lg font-bold text-white px-2">
            <TrendingUpIcon :size="20" class="text-emerald-400" />
            <h2>Économie & Flux</h2>
          </div>

          <AdminCard no-padding>
            <div v-if="activityQuery.isLoading.value" class="p-12 flex justify-center">
              <ProgressSpinner />
            </div>
            <div v-else class="p-4 space-y-4">
              <div
                v-for="tx in activityQuery.data.value?.recentTransactions || []"
                :key="tx.id"
                class="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-emerald-500/30 transition-all"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner"
                  >
                    <CoinsIcon v-if="tx.type.includes('coin')" :size="16" class="text-amber-400" />
                    <AwardIcon
                      v-else-if="tx.type.includes('badge')"
                      :size="16"
                      class="text-indigo-400"
                    />
                    <ZapIcon v-else :size="16" class="text-blue-400" />
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-white">{{ tx.pseudo }}</span>
                    <span class="text-[9px] text-slate-500 uppercase font-black tracking-widest">{{
                      tx.type.replace('_', ' ')
                    }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <div
                    class="text-sm font-mono font-black"
                    :class="tx.type.includes('gain') ? 'text-emerald-400' : 'text-rose-400'"
                  >
                    {{ tx.type.includes('gain') ? '+' : '-' }}{{ tx.amount }}
                  </div>
                  <div class="text-[10px] text-slate-600 font-mono">
                    {{ new Date(tx.createdAt).toLocaleTimeString() }}
                  </div>
                </div>
              </div>
              <div
                v-if="!activityQuery.data.value?.recentTransactions?.length && !activityQuery.isLoading.value"
                class="text-center py-12 text-slate-600 text-sm italic"
              >
                Aucun échange récent.
              </div>
            </div>
          </AdminCard>
        </div>
      </div>

      <!-- Sidebar Stats -->
      <div class="space-y-6">
        <!-- Retention: DAU -->
        <div
          class="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm relative overflow-hidden"
        >
          <dt class="truncate text-sm font-medium text-slate-400">Joueurs Actifs (24h)</dt>
          <dd class="mt-2 text-3xl font-semibold tracking-tight text-indigo-400">
            {{ stats?.dailyActiveUsers || 0 }}
          </dd>
          <p class="mt-1 text-xs text-slate-500">DAU (Daily Active Users)</p>
        </div>

        <!-- Retention: Avg Prestige -->
        <div
          class="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm relative overflow-hidden"
        >
          <dt class="truncate text-sm font-medium text-slate-400">Prestige Moyen</dt>
          <dd class="mt-2 text-3xl font-semibold tracking-tight text-amber-400">
            {{ stats?.avgPrestige || 0 }}
          </dd>
          <p class="mt-1 text-xs text-slate-500">Progression globale</p>
        </div>

        <!-- Retention: Active Quests -->
        <div
          class="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm relative overflow-hidden"
        >
          <dt class="truncate text-sm font-medium text-slate-400">Quêtes en cours</dt>
          <dd class="mt-2 text-3xl font-semibold tracking-tight text-emerald-400">
            {{ stats?.activeQuests || 0 }}
          </dd>
          <p class="mt-1 text-xs text-slate-500">Engagement missions</p>
        </div>
      </div>
    </div>
  </div>
</template>
