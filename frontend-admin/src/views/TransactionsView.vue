<script setup lang="ts">
import { useAdminTransactions } from '@/composables/useAdminTransactions';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import InputText from 'primevue/inputtext';
import { ref } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import PageHeader from '@/components/common/PageHeader.vue';
import AdminCard from '@/components/common/AdminCard.vue';
import { HistoryIcon, SearchIcon } from 'lucide-vue-next';

const { transactionsQuery } = useAdminTransactions();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const getTypeSeverity = (type: string) => {
  if (type.includes('gain')) return 'success';
  if (type.includes('spend')) return 'danger';
  if (type.includes('transfer')) return 'info';
  return 'warn';
};
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Audit des Transactions"
      subtitle="Historique complet des mouvements financiers et des échanges d'objets."
    >
      <template #icon>
        <HistoryIcon class="text-indigo-400" />
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
          placeholder="Rechercher par pseudo, ID ou source..."
          class="w-full !pl-12 !bg-slate-950 !border-slate-800 !text-white !rounded-xl !py-3"
        />
      </div>
    </div>

    <div v-if="transactionsQuery.isLoading.value" class="flex justify-center p-12">
      <ProgressSpinner />
    </div>

    <div
      v-else-if="transactionsQuery.isError.value"
      class="text-red-400 p-6 bg-red-500/10 rounded-xl border border-red-500/20 shadow-lg shadow-red-500/5"
    >
      Une erreur est survenue lors du chargement des transactions.
    </div>

    <AdminCard v-else no-padding>
      <DataTable
        v-model:filters="filters"
        :value="transactionsQuery.data.value?.data || []"
        paginator
        :rows="15"
        data-key="id"
        class="p-datatable-sm w-full"
        row-hover
      >
        <template #empty>
          <div class="p-12 text-center text-slate-500 font-medium">Aucune transaction trouvée.</div>
        </template>

        <Column field="pseudo" header="Joueur" sortable>
          <template #body="{ data }">
            <div class="flex flex-col">
              <span class="font-bold text-white">{{ data.pseudo || 'N/A' }}</span>
              <span class="text-[10px] text-slate-500 font-mono">{{ data.playerId }}</span>
            </div>
          </template>
        </Column>
        <Column field="createdAt" header="Date" sortable>
          <template #body="{ data }">
            <span class="text-slate-400 font-mono text-xs">
              {{ new Date(data.createdAt).toLocaleString('fr-FR') }}
            </span>
          </template>
        </Column>
        <Column field="type" header="Type" sortable>
          <template #body="{ data }">
            <Tag
              :value="data.type"
              :severity="getTypeSeverity(data.type)"
              class="uppercase text-[10px]"
            />
          </template>
        </Column>
        <Column field="amount" header="Montant" sortable>
          <template #body="{ data }">
            <span
              :class="
                data.type.includes('gain')
                  ? 'text-green-400 font-black'
                  : 'text-rose-400 font-black'
              "
              class="font-mono"
            >
              {{ data.type.includes('gain') ? '+' : '-' }}{{ data.amount }}
            </span>
          </template>
        </Column>
        <Column field="source" header="Source" sortable>
          <template #body="{ data }">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{
              data.source
            }}</span>
          </template>
        </Column>
      </DataTable>
    </AdminCard>
  </div>
</template>
