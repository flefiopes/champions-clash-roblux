<script setup lang="ts">
import { useAdminFactions } from '@/composables/useAdminFactions';
import { useFactionModals } from '@/composables/useFactionModals';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import PageHeader from '@/components/common/PageHeader.vue';
import AdminCard from '@/components/common/AdminCard.vue';
import FactionFormModal from '@/components/factions/FactionFormModal.vue';
import { FlagIcon } from 'lucide-vue-next';

const { factionsQuery } = useAdminFactions();
const { isFormModalOpen, selectedFaction, openCreateModal, openEditModal } = useFactionModals();
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Factions"
      subtitle="Gestion des camps, des identités visuelles et des scores cumulés."
      button-label="Nouvelle Faction"
      button-icon="pi pi-plus"
      @action="openCreateModal"
    >
      <template #icon>
        <FlagIcon class="text-indigo-400" />
      </template>
    </PageHeader>

    <div v-if="factionsQuery.isLoading.value" class="flex justify-center p-12">
      <ProgressSpinner />
    </div>

    <div
      v-else-if="factionsQuery.isError.value"
      class="text-red-400 p-6 bg-red-500/10 rounded-xl border border-red-500/20 shadow-lg shadow-red-500/5"
    >
      Une erreur est survenue lors du chargement des données.
    </div>

    <AdminCard v-else no-padding>
      <DataTable
        :value="factionsQuery.data.value || []"
        paginator
        :rows="10"
        data-key="id"
        class="p-datatable-sm w-full"
        row-hover
      >
        <template #empty>
          <div class="p-12 text-center text-slate-500 font-medium">Aucune faction trouvée.</div>
        </template>

        <Column field="name" header="Faction" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <div
                class="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                :style="{ backgroundColor: data.colorHex, color: data.colorHex }"
              ></div>
              <span class="font-bold text-white">{{ data.name }}</span>
            </div>
          </template>
        </Column>
        <Column field="warName" header="Saison / Guerre" sortable>
          <template #body="{ data }">
            <span v-if="data.warName" class="text-slate-400 text-sm font-medium">{{
              data.warName
            }}</span>
            <span v-else class="text-slate-600 italic text-sm">Orpheline</span>
          </template>
        </Column>
        <Column field="slogan" header="Slogan" sortable>
          <template #body="{ data }">
            <span class="italic text-slate-500 text-sm">"{{ data.slogan }}"</span>
          </template>
        </Column>
        <Column field="totalPoints" header="Points" sortable>
          <template #body="{ data }">
            <span class="font-black text-indigo-400 font-mono tracking-tight">{{
              data.totalPoints.toLocaleString()
            }}</span>
          </template>
        </Column>
        <Column field="colorHex" header="Code Couleur" sortable>
          <template #body="{ data }">
            <span class="font-mono text-slate-500 text-xs">{{ data.colorHex.toUpperCase() }}</span>
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
    </AdminCard>

    <!-- Modals -->
    <FactionFormModal v-model:visible="isFormModalOpen" :faction="selectedFaction" />
  </div>
</template>
