<script setup lang="ts">
import { useAdminFactions } from '@/composables/useAdminFactions';
import { useFactionModals } from '@/composables/useFactionModals';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import FactionFormModal from '@/components/factions/FactionFormModal.vue';

const { factionsQuery } = useAdminFactions();
const {
  isFormModalOpen,
  selectedFaction,
  openCreateModal,
  openEditModal,
} = useFactionModals();
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight text-white">Factions</h1>
      <Button
        label="Nouvelle Faction"
        icon="pi pi-plus"
        class="!bg-indigo-600 hover:!bg-indigo-500 !border-none"
        @click="openCreateModal"
      />
    </div>

    <div v-if="factionsQuery.isLoading.value" class="flex justify-center p-8">
      <ProgressSpinner />
    </div>

    <div v-else-if="factionsQuery.isError.value" class="text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
      Une erreur est survenue lors du chargement des données.
    </div>

    <div v-else class="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
      <DataTable
        :value="factionsQuery.data.value || []"
        paginator
        :rows="10"
        data-key="id"
        class="p-datatable-sm w-full"
        row-hover
      >
        <template #empty>
          <div class="p-6 text-center text-slate-400">Aucune faction trouvée.</div>
        </template>

        <Column field="name" header="Nom" sortable/>
        <Column field="warName" header="Guerre" sortable>
          <template #body="{ data }">
            <span v-if="data.warName" class="text-slate-300">{{ data.warName }}</span>
            <span v-else class="text-slate-500 italic">Inconnue</span>
          </template>
        </Column>
        <Column field="slogan" header="Slogan" sortable>
          <template #body="{ data }">
            <span class="italic text-slate-400">"{{ data.slogan }}"</span>
          </template>
        </Column>
        <Column field="totalPoints" header="Points" sortable>
          <template #body="{ data }">
            <span class="font-bold text-indigo-400">{{ data.totalPoints.toLocaleString() }}</span>
          </template>
        </Column>
        <Column header="Couleur">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full border border-slate-700" :style="{ backgroundColor: data.colorHex }"></div>
              <span>{{ data.colorHex }}</span>
            </div>
          </template>
        </Column>

        <!-- Actions Column -->
        <Column header="Actions" :exportable="false" style="min-width: 8rem">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                icon="pi pi-pencil"
                outlined
                rounded
                class="!text-indigo-400 !border-indigo-400 hover:!bg-indigo-500/10"
                @click="openEditModal(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Modals -->
    <FactionFormModal
      v-model:visible="isFormModalOpen"
      :faction="selectedFaction"
    />
  </div>
</template>
