<script setup lang="ts">
import { useAdminTransactions } from '@/composables/useAdminTransactions';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import PageHeader from '@/components/common/PageHeader.vue';
import AdminCard from '@/components/common/AdminCard.vue';
import { HistoryIcon } from 'lucide-vue-next';

const { transactionsQuery } = useAdminTransactions();
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Logs des Mini-Jeux"
      subtitle="Historique détaillé des sessions de jeu, performances des joueurs et récompenses distribuées."
    >
      <template #icon>
        <HistoryIcon class="text-indigo-400" />
      </template>
    </PageHeader>

    <div v-if="transactionsQuery.isLoading.value" class="flex justify-center p-12">
      <ProgressSpinner />
    </div>

    <div
      v-else-if="transactionsQuery.isError.value"
      class="text-red-400 p-6 bg-red-500/10 rounded-xl border border-red-500/20 shadow-lg shadow-red-500/5"
    >
      Une erreur est survenue lors du chargement des logs d'activité.
    </div>

    <AdminCard v-else no-padding>
      <DataTable
        :value="
          transactionsQuery.data.value?.data.filter((t: any) => t.source.startsWith('minigame_')) ||
          []
        "
        paginator
        :rows="15"
        data-key="id"
        class="p-datatable-sm w-full"
        row-hover
      >
        <template #empty>
          <div class="p-12 text-center text-slate-500 font-medium italic">
            Aucun log de mini-jeu détecté dans le registre.
          </div>
        </template>

        <Column field="createdAt" header="Date" sortable>
          <template #body="{ data }">
            <span class="text-slate-400 font-mono text-xs">
              {{ new Date(data.createdAt).toLocaleString('fr-FR') }}
            </span>
          </template>
        </Column>

        <Column field="pseudo" header="Joueur" sortable>
          <template #body="{ data }">
            <div class="flex flex-col">
              <span class="font-bold text-white tracking-tight">{{
                data.pseudo || 'Inconnu'
              }}</span>
              <span class="text-[10px] text-slate-600 font-mono">{{ data.playerId }}</span>
            </div>
          </template>
        </Column>

        <Column field="source" header="Module" sortable>
          <template #body="{ data }">
            <Tag
              :value="data.source.replace('minigame_', '').toUpperCase()"
              severity="info"
              class="!bg-indigo-500/10 !text-indigo-400 !font-black !text-[10px] !tracking-widest !px-3"
            />
          </template>
        </Column>

        <Column field="meta.rank" header="Classement" sortable>
          <template #body="{ data }">
            <div
              v-if="data.meta?.rank"
              class="flex items-center justify-center w-8 h-8 rounded-lg font-black italic shadow-inner border border-slate-800"
              :class="
                data.meta.rank === 1
                  ? 'bg-amber-400/10 text-amber-400'
                  : 'bg-slate-950 text-slate-400'
              "
            >
              #{{ data.meta.rank }}
            </div>
            <span v-else class="text-slate-700 font-mono">-</span>
          </template>
        </Column>

        <Column field="meta.score" header="Score" sortable>
          <template #body="{ data }">
            <span class="font-mono font-bold text-slate-300">{{ data.meta?.score ?? '-' }}</span>
          </template>
        </Column>

        <Column field="amount" header="Récompense" sortable>
          <template #body="{ data }">
            <span class="text-emerald-400 font-black font-mono">+{{ data.amount }}</span>
          </template>
        </Column>
      </DataTable>
    </AdminCard>
  </div>
</template>
