<script setup lang="ts">
import { useAdminWars } from '@/composables/useAdminWars';
import { useWarModals } from '@/composables/useWarModals';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import WarFormModal from '@/components/wars/WarFormModal.vue';
import WarFinishModal from '@/components/wars/WarFinishModal.vue';

const { warsQuery } = useAdminWars();
const {
  isFormModalOpen,
  isFinishModalOpen,
  selectedWar,
  openCreateModal,
  openEditModal,
  openFinishModal,
} = useWarModals();

const getSeverity = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'completed':
    case 'finished':
      return 'info';
    case 'pending':
    case 'paused':
      return 'warn';
    default:
      return undefined;
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case 'active': return 'Actif';
    case 'paused': return 'En pause';
    case 'finished': return 'Terminé';
    default: return status;
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight text-white">Saisons / Guerres</h1>
      <Button
        label="Nouvelle Guerre"
        icon="pi pi-plus"
        @click="openCreateModal"
        class="!bg-indigo-600 hover:!bg-indigo-500 !border-none"
      />
    </div>

    <div v-if="warsQuery.isLoading.value" class="flex justify-center p-8">
      <ProgressSpinner />
    </div>

    <div v-else-if="warsQuery.isError.value" class="text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
      Une erreur est survenue lors du chargement des données.
    </div>

    <div v-else class="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
      <DataTable
        :value="warsQuery.data.value || []"
        paginator
        :rows="10"
        data-key="id"
        class="p-datatable-sm w-full"
        row-hover
      >
        <template #empty>
          <div class="p-6 text-center text-slate-400">Aucune guerre trouvée.</div>
        </template>

        <Column
          field="id"
          header="ID"
          sortable
          style="width: 25%"
        />
        <Column field="name" header="Nom de la Saison" sortable style="width: 25%" />
        <Column field="createdAt" header="Date de Création" sortable>
          <template #body="{ data }">
            {{ new Date(data.createdAt).toLocaleString('fr-FR') }}
          </template>
        </Column>
        <Column field="endsAt" header="Date de Fin" sortable>
          <template #body="{ data }">
            {{ data.endsAt ? new Date(data.endsAt).toLocaleString('fr-FR') : '-' }}
          </template>
        </Column>
        <Column field="status" header="Statut" sortable>
          <template #body="{ data }">
            <Tag :value="formatStatus(data.status)" :severity="getSeverity(data.status)" />
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
              <Button
                icon="pi pi-stop-circle"
                outlined
                rounded
                severity="danger"
                class="!text-red-400 !border-red-400 hover:!bg-red-500/10"
                @click="openFinishModal(slotProps.data)"
                v-if="slotProps.data.status !== 'finished'"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Modals -->
    <WarFormModal
      v-model:visible="isFormModalOpen"
      :war="selectedWar"
    />
    <WarFinishModal
      v-model:visible="isFinishModalOpen"
      :war="selectedWar"
    />
  </div>
</template>
