<script setup lang="ts">
import { useAdminTransactions } from '@/composables/useAdminTransactions';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';

// const selectedMinigame = ref<string>('');

// We'll filter by source in a future update if we want dropdown filtering, 
// for now we show all 'minigame_%' sources if the backend supported LIKE (but it supports exact match now).
// Actually, I'll filter specifically for minigame related transactions if possible.
const { transactionsQuery } = useAdminTransactions(200, { type: 'coin_gain' }); // We'll filter minigames inbody for now or add LIKE in backend
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-white">Logs des Mini-Jeux</h1>
        <p class="text-slate-400">Historique des sessions et récompenses attribuées.</p>
      </div>
    </div>

    <div v-if="transactionsQuery.isLoading.value" class="flex justify-center p-8">
      <ProgressSpinner />
    </div>

    <div
      v-else-if="transactionsQuery.isError.value"
      class="text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20"
    >
      Une erreur est survenue lors du chargement des logs.
    </div>

    <div v-else class="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
      <DataTable
        :value="transactionsQuery.data.value?.data.filter(t => t.source.startsWith('minigame_')) || []"
        paginator
        :rows="15"
        data-key="id"
        class="p-datatable-sm w-full"
        row-hover
      >
        <template #empty>
          <div class="p-6 text-center text-slate-400">Aucun log de mini-jeu trouvé.</div>
        </template>

        <Column field="createdAt" header="Date" sortable>
          <template #body="{ data }">
            {{ new Date(data.createdAt).toLocaleString('fr-FR') }}
          </template>
        </Column>
        
        <Column field="username" header="Joueur" sortable>
          <template #body="{ data }">
             <div class="flex flex-col">
               <span class="font-medium text-white">{{ data.username || 'Inconnu' }}</span>
               <span class="text-xs text-slate-500">{{ data.playerId }}</span>
             </div>
          </template>
        </Column>

        <Column field="source" header="Mini-Jeu" sortable>
          <template #body="{ data }">
            <Tag :value="data.source.replace('minigame_', '').toUpperCase()" severity="info" />
          </template>
        </Column>

        <Column field="meta.rank" header="Rang" sortable>
          <template #body="{ data }">
            <span v-if="data.meta?.rank" class="font-bold" :class="data.meta.rank <= 3 ? 'text-yellow-400' : 'text-slate-300'">
              #{{ data.meta.rank }}
            </span>
            <span v-else class="text-slate-500">-</span>
          </template>
        </Column>

        <Column field="meta.score" header="Score" sortable>
          <template #body="{ data }">
            {{ data.meta?.score ?? '-' }}
          </template>
        </Column>

        <Column field="amount" header="Coins" sortable>
          <template #body="{ data }">
            <span class="text-green-400 font-bold">+{{ data.amount }}</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
