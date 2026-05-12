<script setup lang="ts">
import { useAdminTransactions } from '@/composables/useAdminTransactions';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';

const { transactionsQuery } = useAdminTransactions(500);

const getTypeSeverity = (type: string) => {
  if (type.includes('gain')) return 'success';
  if (type.includes('spend')) return 'danger';
  return 'info';
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight text-white">Registre des Transactions (Audit)</h1>
    </div>

    <div v-if="transactionsQuery.isLoading.value" class="flex justify-center p-8">
      <ProgressSpinner />
    </div>

    <div v-else-if="transactionsQuery.isError.value" class="text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
      Une erreur est survenue lors du chargement des données.
    </div>

    <div v-else class="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
      <DataTable
        :value="transactionsQuery.data.value || []"
        paginator
        :rows="15"
        data-key="id"
        class="p-datatable-sm w-full"
        row-hover
      >
        <template #empty>
          <div class="p-6 text-center text-slate-400">Aucune transaction trouvée.</div>
        </template>

        <Column field="id" header="ID" sortable/>
        <Column field="createdAt" header="Date" sortable>
          <template #body="{ data }">
            {{ new Date(data.createdAt).toLocaleString('fr-FR') }}
          </template>
        </Column>
        <Column field="playerId" header="Joueur (Roblox ID)" sortable/>
        <Column field="type" header="Type" sortable>
          <template #body="{ data }">
            <Tag :value="data.type" :severity="getTypeSeverity(data.type)" />
          </template>
        </Column>
        <Column field="amount" header="Montant" sortable>
          <template #body="{ data }">
            <span :class="data.type.includes('gain') ? 'text-green-400 font-bold' : 'text-red-400 font-bold'">
              {{ data.type.includes('gain') ? '+' : '-' }}{{ data.amount }}
            </span>
          </template>
        </Column>
        <Column field="description" header="Description"/>
      </DataTable>
    </div>
  </div>
</template>
