<script setup lang="ts">
import { useAdminFactions } from '@/composables/useAdminFactions';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';

const { factionsQuery } = useAdminFactions();
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight text-white">Factions</h1>
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

        <Column field="id" header="ID" sortable/>
        <Column field="name" header="Nom" sortable/>
        <Column header="Couleur">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full border border-slate-700" :style="{ backgroundColor: data.colorHex }"></div>
              <span>{{ data.colorHex }}</span>
            </div>
          </template>
        </Column>
        <Column field="maxPlayers" header="Joueurs Max" sortable/>
        <Column field="isActive" header="Statut" sortable>
          <template #body="{ data }">
            <Tag :value="data.isActive ? 'Actif' : 'Inactif'" :severity="data.isActive ? 'success' : 'danger'" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
