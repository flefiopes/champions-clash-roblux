<script setup lang="ts">
import { useAdminStats } from '@/composables/use-admin-stats';
import {
  UsersIcon,
  SwordsIcon,
  ShieldIcon,
  FlagIcon,
} from 'lucide-vue-next';

const { data: stats, isLoading, isError } = useAdminStats();
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-white">
        Dashboard Overview
      </h1>
      <p class="text-sm text-slate-400">Platform statistics and insights.</p>
    </div>

    <!-- Error State -->
    <div
      v-if="isError"
      class="rounded-lg bg-red-500/10 p-4 text-red-400 border border-red-500/20"
    >
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
        <dt class="truncate text-sm font-medium text-slate-400">
          Guerres Totales
        </dt>
        <dd class="mt-2 text-3xl font-semibold tracking-tight text-white">
          {{ stats.totalWars }}
        </dd>
      </div>

      <!-- Active Wars -->
      <div
        class="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm relative overflow-hidden"
      >
        <div
          class="absolute -right-6 -top-6 rounded-full bg-amber-500/10 p-8"
        >
          <ShieldIcon class="h-8 w-8 text-amber-400" />
        </div>
        <dt class="truncate text-sm font-medium text-slate-400">
          Guerres Actives
        </dt>
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
        <dt class="truncate text-sm font-medium text-slate-400">
          Factions Enregistrées
        </dt>
        <dd class="mt-2 text-3xl font-semibold tracking-tight text-white">
          {{ stats.totalFactions }}
        </dd>
      </div>
    </div>
  </div>
</template>
