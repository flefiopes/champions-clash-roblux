<script setup lang="ts">
import { useAdminStats } from '@/composables/use-admin-stats';
import {
  UsersIcon,
  FolderDotIcon,
  MusicIcon,
  UserPlusIcon,
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
        <dt class="truncate text-sm font-medium text-slate-400">Total Users</dt>
        <dd class="mt-2 text-3xl font-semibold tracking-tight text-white">
          {{ stats.totalUsers }}
        </dd>
      </div>

      <!-- Total Projects -->
      <div
        class="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm relative overflow-hidden"
      >
        <div class="absolute -right-6 -top-6 rounded-full bg-cyan-500/10 p-8">
          <FolderDotIcon class="h-8 w-8 text-cyan-400" />
        </div>
        <dt class="truncate text-sm font-medium text-slate-400">
          Total Projects
        </dt>
        <dd class="mt-2 text-3xl font-semibold tracking-tight text-white">
          {{ stats.totalProjects }}
        </dd>
      </div>

      <!-- Total Tracks -->
      <div
        class="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm relative overflow-hidden"
      >
        <div
          class="absolute -right-6 -top-6 rounded-full bg-emerald-500/10 p-8"
        >
          <MusicIcon class="h-8 w-8 text-emerald-400" />
        </div>
        <dt class="truncate text-sm font-medium text-slate-400">
          Total Tracks
        </dt>
        <dd class="mt-2 text-3xl font-semibold tracking-tight text-white">
          {{ stats.totalTracks }}
        </dd>
      </div>

      <!-- New Users -->
      <div
        class="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm relative overflow-hidden"
      >
        <div class="absolute -right-6 -top-6 rounded-full bg-violet-500/10 p-8">
          <UserPlusIcon class="h-8 w-8 text-violet-400" />
        </div>
        <dt class="truncate text-sm font-medium text-slate-400">
          New Users (This Month)
        </dt>
        <dd class="mt-2 text-3xl font-semibold tracking-tight text-white">
          {{ stats.newUsersThisMonth }}
        </dd>
      </div>
    </div>
  </div>
</template>
