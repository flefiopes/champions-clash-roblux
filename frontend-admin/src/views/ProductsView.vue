<script setup lang="ts">
import { useAdminProducts } from '@/composables/useAdminProducts';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';

const { productsQuery } = useAdminProducts();
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight text-white">Boutique & Produits</h1>
    </div>

    <div v-if="productsQuery.isLoading.value" class="flex justify-center p-8">
      <ProgressSpinner />
    </div>

    <div v-else-if="productsQuery.isError.value" class="text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
      Une erreur est survenue lors du chargement des données.
    </div>

    <div v-else class="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
      <DataTable
        :value="productsQuery.data.value || []"
        paginator
        :rows="10"
        data-key="id"
        class="p-datatable-sm w-full"
        row-hover
      >
        <template #empty>
          <div class="p-6 text-center text-slate-400">Aucun produit trouvé.</div>
        </template>

        <Column field="id" header="ID Produit (Roblox)" sortable/>
        <Column field="name" header="Nom" sortable/>
        <Column field="priceRobux" header="Prix (Robux)" sortable>
          <template #body="{ data }">
            <span class="font-bold text-green-400">R$ {{ data.priceRobux }}</span>
          </template>
        </Column>
        <Column field="rewardType" header="Type de Récompense" sortable/>
        <Column field="rewardAmount" header="Montant" sortable/>
        <Column field="isActive" header="Statut" sortable>
          <template #body="{ data }">
            <Tag :value="data.isActive ? 'En vente' : 'Retiré'" :severity="data.isActive ? 'success' : 'danger'" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
