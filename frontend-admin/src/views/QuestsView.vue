<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAdminQuests } from '@/composables/useAdminRewards';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';
import { FilterMatchMode } from '@primevue/core/api';
import PageHeader from '@/components/common/PageHeader.vue';
import AdminCard from '@/components/common/AdminCard.vue';
import AdminStatsCard from '@/components/common/AdminStatsCard.vue';
import { ScrollTextIcon, SearchIcon, TrophyIcon, CoinsIcon, ZapIcon } from 'lucide-vue-next';
import QuestFormModal from '@/components/rewards/QuestFormModal.vue';

import type { Quest, CreateQuestDto } from '@/types/admin.types';

const { questsQuery, createQuest, updateQuest } = useAdminQuests();

const isModalOpen = ref(false);
const selectedQuest = ref<Quest | null>(null);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const openCreateModal = () => {
  selectedQuest.value = null;
  isModalOpen.value = true;
};

const openEditModal = (quest: Quest) => {
  selectedQuest.value = quest;
  isModalOpen.value = true;
};

const handleSave = async (data: CreateQuestDto) => {
  if (selectedQuest.value) {
    await updateQuest.mutateAsync({ id: selectedQuest.value.id, data });
  } else {
    await createQuest.mutateAsync(data);
  }
  isModalOpen.value = false;
};

const getQuestTypeSeverity = (type: string) => {
  switch (type) {
    case 'daily':
      return 'info';
    case 'recruit':
      return 'success';
    case 'seasonal':
      return 'warn';
    case 'secret':
      return 'danger';
    default:
      return 'secondary';
  }
};

const stats = computed(() => {
  const items = questsQuery.data.value || [];
  return {
    total: items.length,
    daily: items.filter((i) => i.type === 'daily').length,
    seasonal: items.filter((i) => i.type === 'seasonal').length,
  };
});
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Gestion des Quêtes"
      subtitle="Définition des missions, objectifs d'engagement et récompenses de progression."
      button-label="Nouvelle Quête"
      button-icon="pi pi-plus"
      @action="openCreateModal"
    >
      <template #icon>
        <ScrollTextIcon class="text-indigo-400" />
      </template>
    </PageHeader>

    <!-- Stats Grid -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <AdminStatsCard
        label="Missions Totales"
        :value="stats.total"
        :icon="ScrollTextIcon"
        icon-bg-class="bg-indigo-500/10"
        icon-color-class="text-indigo-400"
        :is-loading="questsQuery.isLoading.value"
      />
      <AdminStatsCard
        label="Quêtes Journalières"
        :value="stats.daily"
        :icon="ZapIcon"
        icon-bg-class="bg-amber-500/10"
        icon-color-class="text-amber-400"
        :is-loading="questsQuery.isLoading.value"
      />
      <AdminStatsCard
        label="Événements Saisonniers"
        :value="stats.seasonal"
        :icon="TrophyIcon"
        icon-bg-class="bg-emerald-500/10"
        icon-color-class="text-emerald-400"
        :is-loading="questsQuery.isLoading.value"
      />
    </div>

    <!-- Filters & Search -->
    <div
      class="flex items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl shadow-black/20"
    >
      <div class="relative w-full max-w-md">
        <SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" :size="18" />
        <InputText
          v-model="filters['global'].value"
          placeholder="Filtrer par titre ou objectif..."
          class="w-full !pl-12 !bg-slate-950 !border-slate-800 !text-white !rounded-xl !py-3"
        />
      </div>
    </div>

    <div v-if="questsQuery.isLoading.value" class="flex justify-center p-12">
      <ProgressSpinner />
    </div>

    <AdminCard v-else no-padding>
      <DataTable
        v-model:filters="filters"
        :value="questsQuery.data.value || []"
        paginator
        :rows="10"
        class="p-datatable-sm w-full"
        row-hover
        :global-filter-fields="['title', 'type', 'requirementType']"
      >
        <template #empty>
          <div class="p-20 text-center text-slate-600 flex flex-col items-center gap-4">
            <ScrollTextIcon :size="64" class="opacity-10" />
            <p class="max-w-xs mx-auto font-medium">
              Aucune quête ne correspond à votre recherche.
            </p>
          </div>
        </template>

        <Column field="title" header="Mission" sortable>
          <template #body="{ data }">
            <div class="flex flex-col">
              <span class="font-black text-white text-base tracking-tight">{{ data.title }}</span>
              <span class="text-xs text-slate-500 font-medium truncate max-w-xs">{{
                data.description
              }}</span>
            </div>
          </template>
        </Column>

        <Column field="type" header="Cycle" sortable>
          <template #body="{ data }">
            <Tag
              :value="data.type.toUpperCase()"
              :severity="getQuestTypeSeverity(data.type)"
              class="text-[10px] font-black tracking-widest px-3"
            />
          </template>
        </Column>

        <Column field="requirementType" header="Objectif" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black text-slate-500 uppercase tracking-tighter"
                >{{ data.requirementType }}:</span
              >
              <span class="font-black text-indigo-400 font-mono">{{ data.requirementValue }}</span>
            </div>
          </template>
        </Column>

        <Column header="Récompenses">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <div
                v-if="data.rewardCoins"
                class="flex items-center gap-1.5 text-[10px] text-amber-400 font-black bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20"
              >
                <CoinsIcon :size="10" /> {{ data.rewardCoins }}
              </div>
              <div
                v-if="data.rewardXp"
                class="flex items-center gap-1.5 text-[10px] text-emerald-400 font-black bg-emerald-400/10 px-3 py-1 rounded-lg border border-emerald-400/20"
              >
                <ZapIcon :size="10" /> {{ data.rewardXp }}
              </div>
            </div>
          </template>
        </Column>

        <Column class="w-16">
          <template #body="{ data }">
            <Button
              icon="pi pi-pencil"
              text
              rounded
              class="!text-slate-500 hover:!text-indigo-400 hover:!bg-indigo-500/10 transition-all"
              @click="openEditModal(data)"
            />
          </template>
        </Column>
      </DataTable>
    </AdminCard>

    <QuestFormModal
      v-model:visible="isModalOpen"
      :quest="selectedQuest"
      :loading="createQuest.isPending.value || updateQuest.isPending.value"
      @save="handleSave"
    />

    <div
      class="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-indigo-400/60 flex items-center gap-4 shadow-inner"
    >
      <TrophyIcon :size="20" class="text-indigo-400 opacity-40" />
      <span class="font-medium"
        >Les modifications de quêtes sont synchronisées lors de la prochaine session des
        joueurs.</span
      >
    </div>
  </div>
</template>
