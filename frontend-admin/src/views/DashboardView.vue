<script setup lang="ts">
import { useAdminStats, useAdminActivity } from '@/composables/use-admin-stats';
import {
  UsersIcon,
  SwordsIcon,
  ShieldIcon,
  FlagIcon,
  ScrollText,
  TrendingUp,
  Coins,
  Award,
  Zap,
} from 'lucide-vue-next';

const { data: stats, isLoading, isError } = useAdminStats();
const activityQuery = useAdminActivity();
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
      <p class="text-sm text-slate-400">Platform statistics and insights.</p>
    </div>

    <!-- Error State -->
    <div v-if="isError" class="rounded-lg bg-red-500/10 p-4 text-red-400 border border-red-500/20">
      Failed to load dashboard statistics.
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="i in 4"
        :key="i"
        class="animate-pulse rounded-xl border border-slate-800 bg-slate-900/50 p-6 h-32"
      ></div>
    </div>

    <!-- Stats Grid -->
    <div v-else-if="stats" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Total Users -->
      <div
        class="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm relative overflow-hidden"
      >
        <div class="absolute -right-6 -top-6 rounded-full bg-indigo-500/10 p-8">
          <UsersIcon class="h-8 w-8 text-indigo-400" />
        </div>
        <dt class="truncate text-sm font-medium text-slate-400">Joueurs Totaux</dt>
        <dd class="mt-2 text-3xl font-semibold tracking-tight text-white">
          {{ stats.totalPlayers }}
        </dd>
      </div>

      <!-- Total Wars -->
      <div
        class="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm relative overflow-hidden"
      >
        <div class="absolute -right-6 -top-6 rounded-full bg-red-500/10 p-8">
          <SwordsIcon class="h-8 w-8 text-red-400" />
        </div>
        <dt class="truncate text-sm font-medium text-slate-400">Guerres Totales</dt>
        <dd class="mt-2 text-3xl font-semibold tracking-tight text-white">
          {{ stats.totalWars }}
        </dd>
      </div>

      <!-- Active Wars -->
      <div
        class="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm relative overflow-hidden"
      >
        <div class="absolute -right-6 -top-6 rounded-full bg-amber-500/10 p-8">
          <ShieldIcon class="h-8 w-8 text-amber-400" />
        </div>
        <dt class="truncate text-sm font-medium text-slate-400">Guerres Actives</dt>
        <dd class="mt-2 text-3xl font-semibold tracking-tight text-white">
          {{ stats.activeWars }}
        </dd>
      </div>

      <!-- Total Factions -->
      <div
        class="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm relative overflow-hidden"
      >
        <div class="absolute -right-6 -top-6 rounded-full bg-emerald-500/10 p-8">
          <FlagIcon class="h-8 w-8 text-emerald-400" />
        </div>
        <dt class="truncate text-sm font-medium text-slate-400">Factions Enregistrées</dt>
        <dd class="mt-2 text-3xl font-semibold tracking-tight text-white">
          {{ stats.totalFactions }}
        </dd>
      </div>

      <!-- Retention: DAU -->
      <div
        class="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm relative overflow-hidden"
      >
        <dt class="truncate text-sm font-medium text-slate-400">Joueurs Actifs (24h)</dt>
        <dd class="mt-2 text-3xl font-semibold tracking-tight text-indigo-400">
          {{ stats.dailyActiveUsers }}
        </dd>
        <p class="mt-1 text-xs text-slate-500">DAU (Daily Active Users)</p>
      </div>

      <!-- Retention: Avg Prestige -->
      <div
        class="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm relative overflow-hidden"
      >
        <dt class="truncate text-sm font-medium text-slate-400">Prestige Moyen</dt>
        <dd class="mt-2 text-3xl font-semibold tracking-tight text-amber-400">
          {{ stats.avgPrestige }}
        </dd>
        <p class="mt-1 text-xs text-slate-500">Progression globale</p>
      </div>

      <!-- Retention: Active Quests -->
      <div
        class="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm relative overflow-hidden"
      >
        <dt class="truncate text-sm font-medium text-slate-400">Quêtes en cours</dt>
        <dd class="mt-2 text-3xl font-semibold tracking-tight text-emerald-400">
          {{ stats.activeQuests }}
        </dd>
        <p class="mt-1 text-xs text-slate-500">Engagement missions</p>
      </div>
    </div>

    <!-- Monitoring: Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Quest Completions -->
      <div class="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div class="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <ScrollText class="text-indigo-400" :size="18" />
            <h3 class="font-bold text-white text-sm">Quêtes Récemment Complétées</h3>
          </div>
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
            >Temps Réel</span
          >
        </div>
        <div class="p-4 space-y-4">
          <div
            v-for="quest in activityQuery.data.value?.recentQuests || []"
            :key="quest.id"
            class="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/30 transition-colors"
          >
            <div class="flex flex-col">
              <span class="text-sm font-bold text-white">{{ quest.pseudo }}</span>
              <span class="text-[10px] text-slate-500 font-mono">{{ quest.id }}</span>
            </div>
            <div class="text-right">
              <div class="text-[10px] font-bold text-indigo-400 uppercase">Terminée</div>
              <div class="text-[10px] text-slate-600">
                {{ new Date(quest.completedAt).toLocaleTimeString() }}
              </div>
            </div>
          </div>
          <div
            v-if="!activityQuery.data.value?.recentQuests?.length"
            class="text-center py-8 text-slate-600 text-xs"
          >
            Aucune activité récente détectée.
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div class="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <TrendingUp class="text-emerald-400" :size="18" />
            <h3 class="font-bold text-white text-sm">Économie & Flux</h3>
          </div>
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
            >Derniers Échanges</span
          >
        </div>
        <div class="p-4 space-y-4">
          <div
            v-for="tx in activityQuery.data.value?.recentTransactions || []"
            :key="tx.id"
            class="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/30 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center"
              >
                <Coins v-if="tx.type.includes('coin')" :size="14" class="text-amber-400" />
                <Award v-else-if="tx.type.includes('badge')" :size="14" class="text-indigo-400" />
                <Zap v-else :size="14" class="text-blue-400" />
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-bold text-white">{{ tx.pseudo }}</span>
                <span class="text-[9px] text-slate-500 uppercase">{{
                  tx.type.replace('_', ' ')
                }}</span>
              </div>
            </div>
            <div class="text-right">
              <div
                class="text-sm font-mono font-bold"
                :class="tx.type.includes('gain') ? 'text-emerald-400' : 'text-rose-400'"
              >
                {{ tx.type.includes('gain') ? '+' : '-' }}{{ tx.amount }}
              </div>
              <div class="text-[10px] text-slate-600">
                {{ new Date(tx.createdAt).toLocaleTimeString() }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
