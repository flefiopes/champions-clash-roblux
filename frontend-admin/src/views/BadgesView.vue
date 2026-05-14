<script setup lang="ts">
import { ref } from 'vue';
import { useAdminBadges } from '@/composables/useAdminRewards';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';
import { FilterMatchMode } from '@primevue/core/api';
import { Award, Search, ShieldCheck, Star } from 'lucide-vue-next';
import BadgeFormModal from '@/components/rewards/BadgeFormModal.vue';

import type { Badge, CreateBadgeDto } from '@/types/admin.types';

const { badgesQuery, createBadge, updateBadge } = useAdminBadges();

const isModalOpen = ref(false);
const selectedBadge = ref<Badge | null>(null);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const openCreateModal = () => {
  selectedBadge.value = null;
  isModalOpen.value = true;
};

const openEditModal = (badge: Badge) => {
  selectedBadge.value = badge;
  isModalOpen.value = true;
};

const handleSave = async (data: CreateBadgeDto) => {
  if (selectedBadge.value) {
    await updateBadge.mutateAsync({ id: selectedBadge.value.id, data });
  } else {
    await createBadge.mutateAsync(data);
  }
  isModalOpen.value = false;
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return 'text-slate-400';
    case 'rare':
      return 'text-blue-400';
    case 'epic':
      return 'text-purple-400';
    case 'legendary':
      return 'text-orange-400';
    case 'secret':
      return 'text-pink-400';
    default:
      return 'text-slate-400';
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <div class="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
          <Award :size="24" />
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-white">Collection de Badges</h1>
          <p class="text-slate-400 text-sm">Gestion des succès et objets de collection.</p>
        </div>
      </div>

      <Button
        label="Nouveau Badge"
        icon="pi pi-plus"
        class="!bg-indigo-600 !border-indigo-600 hover:!bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
        @click="openCreateModal"
      />
    </div>

    <!-- Filters -->
    <div
      class="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800"
    >
      <div class="relative w-full max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" :size="18" />
        <InputText
          v-model="filters['global'].value"
          placeholder="Rechercher un badge..."
          class="w-full !pl-10 !bg-slate-950 !border-slate-800"
        />
      </div>
    </div>

    <div v-if="badgesQuery.isLoading.value" class="flex justify-center p-12">
      <ProgressSpinner />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="badge in badgesQuery.data.value || []"
        :key="badge.id"
        class="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 relative overflow-hidden"
      >
        <div class="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Award :size="120" />
        </div>

        <div class="flex items-start gap-4">
          <div
            class="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden"
          >
            <img
              v-if="badge.imageUrl"
              :src="badge.imageUrl"
              :alt="badge.name"
              class="w-full h-full object-cover"
            />
            <ShieldCheck v-else :size="32" class="text-slate-700" />
          </div>

          <div class="flex-1">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-bold text-white group-hover:text-indigo-400 transition-colors">
                {{ badge.name }}
              </h3>
              <Tag
                :value="badge.rarity.toUpperCase()"
                class="!bg-transparent !p-0"
                :class="getRarityColor(badge.rarity)"
              />
            </div>
            <p class="text-xs text-slate-500 line-clamp-2 mb-4">
              {{ badge.description }}
            </p>

            <div class="flex items-center justify-between mt-auto">
              <div class="flex flex-col">
                <span class="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{{
                  badge.slug
                }}</span>
                <div v-if="badge.isPermanent" class="flex items-center gap-1.5 mt-1">
                  <Star :size="10" class="text-amber-400 fill-amber-400" />
                  <span class="text-[9px] font-bold text-slate-500 uppercase tracking-tighter"
                    >Permanent</span
                  >
                </div>
              </div>

              <Button
                icon="pi pi-pencil"
                text
                rounded
                class="!text-slate-500 hover:!text-indigo-400"
                @click="openEditModal(badge)"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!badgesQuery.data.value?.length"
        class="col-span-full p-20 text-center rounded-2xl border-2 border-dashed border-slate-800"
      >
        <Award :size="48" class="text-slate-800 mx-auto mb-4" />
        <p class="text-slate-500">Aucun badge configuré dans la base de données.</p>
      </div>
    </div>

    <BadgeFormModal
      v-model:visible="isModalOpen"
      :badge="selectedBadge"
      :loading="createBadge.isPending.value || updateBadge.isPending.value"
      @save="handleSave"
    />
  </div>
</template>
