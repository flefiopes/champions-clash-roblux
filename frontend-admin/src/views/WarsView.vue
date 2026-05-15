<script setup lang="ts">
import { useAdminWars } from '@/composables/useAdminWars';
import { useWarModals } from '@/composables/useWarModals';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import PageHeader from '@/components/common/PageHeader.vue';
import AdminCard from '@/components/common/AdminCard.vue';
import WarFormModal from '@/components/wars/WarFormModal.vue';
import WarFinishModal from '@/components/wars/WarFinishModal.vue';
import { SwordsIcon } from 'lucide-vue-next';

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
    case 'active':
      return 'Actif';
    case 'paused':
      return 'En pause';
    case 'finished':
      return 'Terminé';
    default:
      return status;
  }
};
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Saisons / Guerres"
      subtitle="Gestion des cycles de compétition et des événements programmés."
      button-label="Nouvelle Guerre"
      button-icon="pi pi-plus"
      @action="openCreateModal"
    >
      <template #icon>
        <SwordsIcon class="text-indigo-400" />
      </template>
    </PageHeader>

    <div v-if="warsQuery.isLoading.value" class="flex justify-center p-12">
      <ProgressSpinner />
    </div>

    <div
      v-else-if="warsQuery.isError.value"
      class="text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20"
    >
      Une erreur est survenue lors du chargement des données.
    </div>

    <AdminCard v-else no-padding>
      <DataTable
        :value="warsQuery.data.value || []"
        paginator
        :rows="10"
        data-key="id"
        class="p-datatable-sm w-full"
        row-hover
      >
        <template #empty>
          <div class="p-12 text-center text-slate-500 font-medium">Aucune guerre trouvée.</div>
        </template>

        <Column
field="id"
header="ID"
sortable
style="width: 25%" />
        <Column
field="name"
header="Nom de la Saison"
sortable
style="width: 25%">
          <template #body="{ data }">
            <span class="font-bold text-white">{{ data.name }}</span>
          </template>
        </Column>
        <Column field="createdAt" header="Date de Création" sortable>
          <template #body="{ data }">
            <span class="text-slate-400 font-mono text-xs">
              {{ new Date(data.createdAt).toLocaleString('fr-FR') }}
            </span>
          </template>
        </Column>
        <Column field="scheduledAt" header="Date de Début" sortable>
          <template #body="{ data }">
            <span class="text-slate-400 font-mono text-xs">
              {{
                data.scheduledAt ? new Date(data.scheduledAt).toLocaleString('fr-FR') : 'Immédiat'
              }}
            </span>
          </template>
        </Column>
        <Column field="endsAt" header="Date de Fin" sortable>
          <template #body="{ data }">
            <span class="text-slate-400 font-mono text-xs">
              {{ data.endsAt ? new Date(data.endsAt).toLocaleString('fr-FR') : '-' }}
            </span>
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
                v-if="slotProps.data.status !== 'finished'"
                icon="pi pi-stop-circle"
                outlined
                rounded
                severity="danger"
                class="!text-red-400 !border-red-400 hover:!bg-red-500/10"
                @click="openFinishModal(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </AdminCard>

    <!-- Modals -->
    <WarFormModal v-model:visible="isFormModalOpen" :war="selectedWar" />
    <WarFinishModal v-model:visible="isFinishModalOpen" :war="selectedWar" />
  </div>
</template>
