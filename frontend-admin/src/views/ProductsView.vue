<script setup lang="ts">
import { useAdminProducts } from '@/composables/useAdminProducts';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import { ref, computed } from 'vue';
import PageHeader from '@/components/common/PageHeader.vue';
import AdminCard from '@/components/common/AdminCard.vue';
import AdminStatsCard from '@/components/common/AdminStatsCard.vue';
import ProductFormModal from '@/components/products/ProductFormModal.vue';
import type { Product, CreateProductDto, UpdateProductDto } from '@/types/admin.types';
import { ShoppingBagIcon, SearchIcon, PackageIcon, ActivityIcon, ZapIcon } from 'lucide-vue-next';
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
  <div class="space-y-8">
    <PageHeader
      title="Boutique & Produits"
      subtitle="Catalogue des objets virtuels, boosts et monnaies premium synchronisés avec Roblox."
      button-label="Nouveau Produit"
      button-icon="pi pi-plus"
      @action="openCreateModal"
    >
      <template #icon>
        <ShoppingBagIcon class="text-indigo-400" />
      </template>
    </PageHeader>

    <!-- Stats Grid -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <AdminStatsCard
        label="Total Catalogue"
        :value="stats.total"
        :icon="PackageIcon"
        icon-bg-class="bg-indigo-500/10"
        icon-color-class="text-indigo-400"
        :is-loading="productsQuery.isLoading.value"
      />
      <AdminStatsCard
        label="Produits Live"
        :value="stats.active"
        :icon="ActivityIcon"
        icon-bg-class="bg-emerald-500/10"
        icon-color-class="text-emerald-400"
        :is-loading="productsQuery.isLoading.value"
      />
      <AdminStatsCard
        label="Valeur Robux Moyenne"
        :value="stats.total ? Math.round(stats.totalPrice / stats.total) : 0"
        :icon="ZapIcon"
        icon-bg-class="bg-amber-500/10"
        icon-color-class="text-amber-400"
        :is-loading="productsQuery.isLoading.value"
      />
    </div>

    <!-- Filters & Search -->
    <div
      class="flex items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl shadow-black/20"
    >
      <div class="relative w-full max-w-md">
        <SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" :size="18" />
        <InputText
          v-model="filters['global'].value"
          placeholder="Rechercher par nom, ID ou type..."
          class="w-full !pl-12 !bg-slate-950 !border-slate-800 !text-white !rounded-xl !py-3"
        />
      </div>
      <div class="flex items-center gap-3">
        <span
          class="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hidden md:block"
          >Registry V1.2</span
        >
        <div class="h-8 w-px bg-slate-800"></div>
        <Tag
          :value="`${stats.active} LIVE`"
          severity="success"
          class="!bg-emerald-500/10 !text-emerald-400 !font-black !px-4"
        />
      </div>
    </div>

    <div v-if="productsQuery.isLoading.value" class="flex justify-center p-12">
      <ProgressSpinner />
    </div>

    <div
      v-else-if="productsQuery.isError.value"
      class="text-red-400 p-6 bg-red-500/10 rounded-3xl border border-red-500/20 shadow-lg shadow-red-500/5 flex items-center gap-4"
    >
      <div class="p-3 bg-red-500/20 rounded-xl">
        <ActivityIcon :size="24" />
      </div>
      <div>
        <h3 class="font-bold text-lg text-white">Erreur de monitoring</h3>
        <p class="opacity-80">Impossible d'établir la connexion avec le service des produits.</p>
      </div>
    </div>

    <AdminCard v-else no-padding>
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
          <div class="p-20 text-center text-slate-600 flex flex-col items-center gap-4">
            <PackageIcon :size="64" class="opacity-10" />
            <p class="max-w-xs mx-auto font-medium">
              Aucun produit ne correspond à vos critères de recherche ou le catalogue est vide.
            </p>
          </div>
        </template>

        <Column field="name" header="Produit" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-500 shadow-inner group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors"
              >
                <PackageIcon :size="24" />
              </div>
              <div class="flex flex-col">
                <span class="font-black text-white text-base tracking-tight">{{ data.name }}</span>
                <span class="text-[10px] font-mono text-slate-500 uppercase tracking-tighter"
                  >ID: {{ data.robloxProductId }}</span
                >
              </div>
            </div>
          </template>
        </Column>

        <Column field="priceRobux" header="Prix Roblox" sortable>
          <template #body="{ data }">
            <div
              class="flex items-center gap-2 text-emerald-400 font-black font-mono text-lg px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 w-fit"
            >
              <span class="text-[10px] opacity-40 uppercase tracking-tighter">R$</span>
              {{ data.priceRobux }}
            </div>
          </template>
        </Column>

        <Column field="type" header="Catégorie" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <div
                class="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                :class="{
                  'bg-blue-500 text-blue-500': data.type === 'gems',
                  'bg-purple-500 text-purple-500': data.type === 'boost',
                  'bg-orange-500 text-orange-500': data.type === 'cosmetic',
                  'bg-red-500 text-red-500': data.type === 'faction_reset',
                }"
              ></div>
              <span class="text-xs font-black uppercase tracking-widest text-slate-400">{{
                getTypeLabel(data.type)
              }}</span>
            </div>
          </template>
        </Column>

        <Column field="isActive" header="Status" sortable>
          <template #body="{ data }">
            <div
              class="flex items-center gap-2.5 px-4 py-2 rounded-full w-fit border shadow-sm"
              :class="
                data.isActive
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
              "
            >
              <div
                :class="
                  data.isActive
                    ? 'bg-emerald-400 shadow-[0_0_10px_currentColor]'
                    : 'bg-rose-400 shadow-[0_0_10px_currentColor]'
                "
                class="w-1.5 h-1.5 rounded-full"
              ></div>
              <span class="text-[10px] font-black uppercase tracking-[0.2em]">
                {{ data.isActive ? 'Actif' : 'Off' }}
              </span>
            </div>
          </template>
        </Column>

        <Column class="w-20">
          <template #body="{ data }">
            <Button
              icon="pi pi-pencil"
              text
              rounded
              class="!text-slate-500 hover:!text-indigo-400 hover:!bg-indigo-500/10 transition-all"
              @click="openEditModal(data)"
            />
          </template>
        </Column>
      </DataTable>
    </AdminCard>

    <ProductFormModal
      v-model:visible="isModalOpen"
      :product="selectedProduct"
      :loading="createProduct.isPending.value || updateProduct.isPending.value"
      @save="handleSave"
    />
  </div>
</template>
