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
import { ScrollText, Search, Trophy, Coins, Zap } from 'lucide-vue-next';
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
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <div class="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
          <ScrollText :size="24" />
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-white">Gestion des Quêtes</h1>
          <p class="text-slate-400 text-sm">
            Définition des missions journalières et saisonnières.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div
          class="flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800"
        >
          <div class="flex flex-col">
            <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total</span>
            <span class="text-lg font-bold text-white">{{ stats.total }}</span>
          </div>
          <div class="w-px h-8 bg-slate-800"></div>
          <div class="flex flex-col">
            <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Daily</span>
            <span class="text-lg font-bold text-blue-400">{{ stats.daily }}</span>
          </div>
        </div>
        <Button
          label="Nouvelle Quête"
          icon="pi pi-plus"
          class="!bg-indigo-600 !border-indigo-600 hover:!bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
          @click="openCreateModal"
        />
      </div>
    </div>

    <!-- Filters -->
    <div
      class="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800"
    >
      <div class="relative w-full max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" :size="18" />
        <InputText
          v-model="filters['global'].value"
          placeholder="Rechercher une quête..."
          class="w-full !pl-10 !bg-slate-950 !border-slate-800"
        />
      </div>
    </div>

    <div v-if="questsQuery.isLoading.value" class="flex justify-center p-12">
      <ProgressSpinner />
    </div>

    <div v-else class="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
      <DataTable
        v-model:filters="filters"
        :value="questsQuery.data.value || []"
        paginator
        :rows="10"
        class="p-datatable-sm w-full"
        row-hover
        :global-filter-fields="['title', 'type', 'requirementType']"
      >
        <Column field="title" header="Mission" sortable>
          <template #body="{ data }">
            <div class="flex flex-col">
              <span class="font-bold text-white">{{ data.title }}</span>
              <span class="text-xs text-slate-500 truncate max-w-xs">{{ data.description }}</span>
            </div>
          </template>
        </Column>

        <Column field="type" header="Type" sortable>
          <template #body="{ data }">
            <Tag
              :value="data.type.toUpperCase()"
              :severity="getQuestTypeSeverity(data.type)"
              class="text-[10px]"
            />
          </template>
        </Column>

        <Column field="requirementType" header="Objectif" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-2 text-xs">
              <span class="text-slate-400">{{ data.requirementType }}:</span>
              <span class="font-mono text-indigo-400 font-bold">{{ data.requirementValue }}</span>
            </div>
          </template>
        </Column>

        <Column header="Récompenses">
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <div
                v-if="data.rewardCoins"
                class="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10"
              >
                <Coins :size="10" /> {{ data.rewardCoins }}
              </div>
              <div
                v-if="data.rewardXp"
                class="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10"
              >
                <Zap :size="10" /> {{ data.rewardXp }}
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
              class="!text-slate-500 hover:!text-indigo-400 hover:!bg-indigo-500/5"
              @click="openEditModal(data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <QuestFormModal
      v-model:visible="isModalOpen"
      :quest="selectedQuest"
      :loading="createQuest.isPending.value || updateQuest.isPending.value"
      @save="handleSave"
    />

    <div
      class="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-blue-400 flex items-center gap-3"
    >
      <Trophy :size="16" />
      <span
        >Note: Les modifications de quêtes sont appliquées en temps réel aux nouveaux joueurs ou
        lors d'une nouvelle session.</span
      >
    </div>
  </div>
</template>
