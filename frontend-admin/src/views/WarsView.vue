<script setup lang="ts">
import { useAdminWars } from '@/composables/useAdminWars';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';

const { warsQuery } = useAdminWars();

const getSeverity = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'completed':
      return 'info';
    case 'pending':
      return 'warning';
    default:
      return null;
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight text-white">Saisons / Guerres</h1>
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
style="width: 5%"/>
        <Column field="seasonName" header="Saison" sortable/>
        <Column field="startDate" header="Date de Début" sortable>
          <template #body="{ data }">
            {{ new Date(data.startDate).toLocaleString('fr-FR') }}
          </template>
        </Column>
        <Column field="endDate" header="Date de Fin" sortable>
          <template #body="{ data }">
            {{ data.endDate ? new Date(data.endDate).toLocaleString('fr-FR') : '-' }}
          </template>
        </Column>
        <Column field="status" header="Statut" sortable>
          <template #body="{ data }">
            <Tag :value="data.status" :severity="getSeverity(data.status)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
