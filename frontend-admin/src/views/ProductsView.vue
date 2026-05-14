<script setup lang="ts">
import { useAdminProducts } from '@/composables/useAdminProducts';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import { ref, computed } from 'vue';
import ProductFormModal from '@/components/products/ProductFormModal.vue';
import type { Product, CreateProductDto, UpdateProductDto } from '@/types/admin.types';
import { ShoppingBag, Search, Package, Activity } from 'lucide-vue-next';
import InputText from 'primevue/inputtext';
import { FilterMatchMode } from '@primevue/core/api';

const { productsQuery, createProduct, updateProduct } = useAdminProducts();

const isModalOpen = ref(false);
const selectedProduct = ref<Product | null>(null);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const openCreateModal = () => {
  selectedProduct.value = null;
  isModalOpen.value = true;
};

const openEditModal = (product: Product) => {
  selectedProduct.value = product;
  isModalOpen.value = true;
};

const handleSave = async (data: CreateProductDto | UpdateProductDto) => {
  if (selectedProduct.value) {
    await updateProduct.mutateAsync({
      id: selectedProduct.value.id,
      data: data as UpdateProductDto,
    });
  } else {
    await createProduct.mutateAsync(data as CreateProductDto);
  }
  isModalOpen.value = false;
};

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    gems: 'Gemmes',
    boost: 'Boost',
    cosmetic: 'Cosmétique',
    faction_reset: 'Reset Faction',
  };
  return map[type] || type;
};

const stats = computed(() => {
  const items = productsQuery.data.value || [];
  return {
    total: items.length,
    active: items.filter((i) => i.isActive).length,
    totalPrice: items.reduce((acc, i) => acc + i.priceRobux, 0),
  };
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header & Stats -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <div class="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
          <ShoppingBag :size="24" />
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-white">Boutique & Produits</h1>
          <p class="text-slate-400 text-sm">
            Monitoring et gestion du catalogue Roblox Marketplace.
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <div
          class="flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800"
        >
          <div class="flex flex-col">
            <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total</span>
            <span class="text-lg font-bold text-white">{{ stats.total }}</span>
          </div>
          <div class="w-px h-8 bg-slate-800"></div>
          <div class="flex flex-col">
            <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider"
              >Actifs</span
            >
            <span class="text-lg font-bold text-emerald-400">{{ stats.active }}</span>
          </div>
        </div>
        <Button
          label="Nouveau Produit"
          icon="pi pi-plus"
          class="!bg-indigo-600 !border-indigo-600 hover:!bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
          @click="openCreateModal"
        />
      </div>
    </div>

    <!-- Filters & Search -->
    <div
      class="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800"
    >
      <div class="relative w-full max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" :size="18" />
        <InputText
          v-model="filters['global'].value"
          placeholder="Rechercher un produit ou ID..."
          class="w-full !pl-10 !bg-slate-950 !border-slate-800"
        />
      </div>
      <div class="flex items-center gap-2">
        <Tag
          :value="`V${stats.total}.0`"
          severity="secondary"
          class="!bg-slate-800 !text-slate-400"
        />
      </div>
    </div>

    <div v-if="productsQuery.isLoading.value" class="flex justify-center p-12">
      <ProgressSpinner />
    </div>

    <div
      v-else-if="productsQuery.isError.value"
      class="text-red-400 p-6 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center gap-3"
    >
      <Activity :size="20" />
      <span>Une erreur critique est survenue lors du monitoring des produits.</span>
    </div>

    <div v-else class="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
      <DataTable
        v-model:filters="filters"
        :value="productsQuery.data.value || []"
        paginator
        :rows="12"
        data-key="id"
        class="p-datatable-sm w-full"
        row-hover
        filter-display="menu"
        :global-filter-fields="['name', 'robloxProductId', 'type']"
      >
        <template #empty>
          <div class="p-16 text-center text-slate-500 flex flex-col items-center gap-4">
            <Package :size="48" class="text-slate-800" />
            <p class="max-w-xs mx-auto">
              Aucun produit ne correspond à vos critères de recherche ou le catalogue est vide.
            </p>
            <Button
              v-if="filters['global'].value"
              label="Réinitialiser"
              link
              @click="filters['global'].value = null"
            />
          </div>
        </template>

        <Column field="name" header="Produit Monitoré" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <Package :size="20" />
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-white group-hover:text-indigo-400 transition-colors">{{
                  data.name
                }}</span>
                <span class="text-[10px] font-mono text-slate-500 uppercase tracking-tighter"
                  >REF: {{ data.robloxProductId }}</span
                >
              </div>
            </div>
          </template>
        </Column>

        <Column field="priceRobux" header="Market Price" sortable>
          <template #body="{ data }">
            <div
              class="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10 w-fit"
            >
              <span class="text-[10px] opacity-60">R$</span>
              {{ data.priceRobux }}
            </div>
          </template>
        </Column>

        <Column field="type" header="Catégorie" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="{
                  'bg-blue-400': data.type === 'gems',
                  'bg-purple-400': data.type === 'boost',
                  'bg-orange-400': data.type === 'cosmetic',
                  'bg-red-400': data.type === 'faction_reset',
                }"
              ></span>
              <span class="text-xs font-medium text-slate-300">{{ getTypeLabel(data.type) }}</span>
            </div>
          </template>
        </Column>

        <Column header="Live Payload" class="hidden xl:table-cell">
          <template #body="{ data }">
            <div class="group relative">
              <div
                class="text-[10px] text-slate-500 font-mono bg-black/20 p-2 rounded border border-slate-800/50 max-w-[200px] truncate"
              >
                {{ JSON.stringify(data.value) }}
              </div>
              <div
                class="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded"
              >
                <span class="text-[9px] text-indigo-400 font-bold uppercase tracking-widest"
                  >Voir détails</span
                >
              </div>
            </div>
          </template>
        </Column>

        <Column field="isActive" header="Status" sortable>
          <template #body="{ data }">
            <div
              class="flex items-center gap-2 px-2 py-1 rounded-full w-fit"
              :class="data.isActive ? 'bg-emerald-500/10' : 'bg-rose-500/10'"
            >
              <div
                :class="
                  data.isActive
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : 'bg-rose-500'
                "
                class="w-1.5 h-1.5 rounded-full"
              ></div>
              <span
                :class="data.isActive ? 'text-emerald-400' : 'text-rose-400'"
                class="text-[10px] font-bold uppercase tracking-wider"
              >
                {{ data.isActive ? 'Live' : 'Offline' }}
              </span>
            </div>
          </template>
        </Column>

        <Column class="w-20">
          <template #body="{ data }">
            <div class="flex items-center justify-end gap-1">
              <Button
                icon="pi pi-pencil"
                text
                rounded
                class="!text-slate-500 hover:!text-indigo-400 hover:!bg-indigo-500/5"
                @click="openEditModal(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <ProductFormModal
      v-model:visible="isModalOpen"
      :product="selectedProduct"
      :loading="createProduct.isPending.value || updateProduct.isPending.value"
      @save="handleSave"
    />
  </div>
</template>
