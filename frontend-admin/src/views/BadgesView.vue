<script setup lang="ts">
import { ref } from 'vue';
import { useAdminBadges } from '@/composables/useAdminRewards';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';
import { FilterMatchMode } from '@primevue/core/api';
import PageHeader from '@/components/common/PageHeader.vue';
import { AwardIcon, SearchIcon, ShieldCheckIcon, StarIcon } from 'lucide-vue-next';
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
  <div class="space-y-8">
    <PageHeader
      title="Collection de Badges"
      subtitle="Gestion des succès, raretés et objets de collection pour l'engagement des joueurs."
      button-label="Nouveau Badge"
      button-icon="pi pi-plus"
      @action="openCreateModal"
    >
      <template #icon>
        <AwardIcon class="text-amber-400" />
      </template>
    </PageHeader>

    <!-- Search Bar -->
    <div
      class="flex items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl shadow-black/20"
    >
      <div class="relative w-full max-w-md">
        <SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" :size="18" />
        <InputText
          v-model="filters['global'].value"
          placeholder="Rechercher par nom ou slug..."
          class="w-full !pl-12 !bg-slate-950 !border-slate-800 !text-white !rounded-xl !py-3"
        />
      </div>
    </div>

    <div v-if="badgesQuery.isLoading.value" class="flex justify-center p-12">
      <ProgressSpinner />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="badge in badgesQuery.data.value || []"
        :key="badge.id"
        class="group p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all duration-500 relative overflow-hidden shadow-lg hover:shadow-indigo-500/10"
      >
        <div
          class="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12"
        >
          <AwardIcon :size="160" />
        </div>

        <div class="flex items-start gap-6 relative">
          <div
            class="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500"
          >
            <img
              v-if="badge.imageUrl"
              :src="badge.imageUrl"
              :alt="badge.name"
              class="w-full h-full object-cover"
            />
            <ShieldCheckIcon v-else :size="32" class="text-slate-800" />
          </div>

          <div class="flex-1">
            <div class="flex flex-col mb-2">
              <div class="flex items-center justify-between">
                <Tag
                  :value="badge.rarity.toUpperCase()"
                  class="!bg-transparent !p-0 !font-black !text-[10px] !tracking-widest"
                  :class="getRarityColor(badge.rarity)"
                />
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  class="!text-slate-600 hover:!text-indigo-400 !w-8 !h-8"
                  @click="openEditModal(badge)"
                />
              </div>
              <h3
                class="text-lg font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight mt-1"
              >
                {{ badge.name }}
              </h3>
            </div>

            <p class="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
              {{ badge.description }}
            </p>

            <div class="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/50">
              <span
                class="text-[9px] font-mono text-slate-600 uppercase font-black tracking-widest"
                >{{ badge.slug }}</span
              >

              <div
                v-if="badge.isPermanent"
                class="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20"
              >
                <StarIcon :size="10" class="text-amber-500 fill-amber-500" />
                <span class="text-[9px] font-black text-amber-500 uppercase tracking-tighter"
                  >Permanent</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!badgesQuery.data.value?.length && !badgesQuery.isLoading.value"
        class="col-span-full p-20 text-center rounded-3xl border border-slate-800 bg-slate-900/50 flex flex-col items-center gap-4"
      >
        <AwardIcon :size="64" class="text-slate-800 opacity-20" />
        <p class="text-slate-600 font-medium italic">
          Aucun badge configuré dans la base de données.
        </p>
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
