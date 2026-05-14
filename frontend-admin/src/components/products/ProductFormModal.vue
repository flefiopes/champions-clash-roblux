<script setup lang="ts">
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';
import type { Product, CreateProductDto, UpdateProductDto } from '@/types/admin.types';

const props = defineProps<{
  visible: boolean;
  product?: Product | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'save', data: CreateProductDto | UpdateProductDto): void;
}>();

const types = [
  { label: 'Gemmes', value: 'gems' },
  { label: 'Boost', value: 'boost' },
  { label: 'Cosmétique', value: 'cosmetic' },
  { label: 'Reset Faction', value: 'faction_reset' },
];

const form = ref<any>({
  name: '',
  roblox_product_id: null,
  price_robux: 0,
  type: 'gems',
  value: {},
  is_active: true,
});

// For complex JSON value editing, we'll use simple inputs based on type
const boostTypes = [
  { label: 'XP', value: 'xp' },
  { label: 'Coins', value: 'coins' },
  { label: 'Gems', value: 'gems' },
];

watch(() => props.product, (val) => {
  if (val) {
    form.value = {
      name: val.name,
      roblox_product_id: val.robloxProductId,
      price_robux: val.priceRobux,
      type: val.type,
      value: { ...val.value },
      is_active: val.isActive,
    };
  } else {
    form.value = {
      name: '',
      roblox_product_id: null,
      price_robux: 0,
      type: 'gems',
      value: { gems: 100 },
      is_active: true,
    };
  }
}, { immediate: true });

watch(() => form.value.type, (newType) => {
  if (props.product) return; // Don't reset if editing
  
  if (newType === 'gems') {
    form.value.value = { gems: 100 };
  } else if (newType === 'boost') {
    form.value.value = { boost: 'xp', duration_seconds: 3600, multiplier: 2 };
  } else if (newType === 'cosmetic') {
    form.value.value = { item_id: 'default_hat' };
  } else {
    form.value.value = {};
  }
});

const onSave = () => {
  emit('save', form.value);
};
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    :header="product ? 'Modifier le Produit' : 'Nouveau Produit'"
    modal
    class="w-full max-w-2xl mx-4"
    :contentStyle="{ overflow: 'visible' }"
  >
    <div class="space-y-8 pt-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Main Info -->
        <div class="space-y-6">
          <div class="flex flex-col gap-4">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Configuration de Base</label>
            
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-300">Nom du Produit</label>
              <InputText v-model="form.name" placeholder="ex: 500 Gemmes" class="w-full" />
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-300">ID Roblox</label>
                <InputNumber v-model="form.roblox_product_id" :use-grouping="false" placeholder="12345678" class="w-full" inputClass="w-full" :disabled="!!product" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-300">Prix (Robux)</label>
                <InputNumber v-model="form.price_robux" placeholder="100" class="w-full" inputClass="w-full" />
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-300">Catégorie</label>
              <Select v-model="form.type" :options="types" optionLabel="label" optionValue="value" class="w-full" />
            </div>
          </div>

          <div class="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-800 shadow-inner">
            <div class="flex flex-col">
              <span class="text-sm font-medium text-white">État du Produit</span>
              <span class="text-[10px] text-slate-500 uppercase tracking-wider">Activer pour la vente</span>
            </div>
            <ToggleSwitch v-model="form.is_active" />
          </div>
        </div>

        <!-- Logic & Payload -->
        <div class="space-y-6">
          <div class="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-5 shadow-lg">
            <h3 class="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-3">
              <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Comportement Script
            </h3>
            
            <!-- Type Specific Fields -->
            <div v-if="form.type === 'gems'" class="flex flex-col gap-2">
              <label class="text-sm font-medium text-slate-300">Nombre de Gemmes</label>
              <InputNumber v-model="form.value.gems" class="w-full" inputClass="w-full" />
            </div>

            <div v-if="form.type === 'boost'" class="space-y-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-slate-300">Type de Boost</label>
                <Select v-model="form.value.boost" :options="boostTypes" optionLabel="label" optionValue="value" class="w-full" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-slate-300">Durée (sec)</label>
                  <InputNumber v-model="form.value.duration_seconds" class="w-full" inputClass="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-slate-300">Multiplier</label>
                  <InputNumber v-model="form.value.multiplier" :min-fraction-digits="1" class="w-full" inputClass="w-full" />
                </div>
              </div>
            </div>

            <div v-if="form.type === 'cosmetic'" class="flex flex-col gap-2">
              <label class="text-sm font-medium text-slate-300">ID de l'item</label>
              <InputText v-model="form.value.item_id" class="w-full" />
            </div>

            <div v-if="form.type === 'faction_reset'">
              <p class="text-xs text-slate-400 leading-relaxed italic bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                Action système automatisée : Réinitialise l'affiliation et les points de faction de l'utilisateur.
              </p>
            </div>
          </div>

          <!-- Payload Monitoring -->
          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800/50 shadow-inner">
            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Real-time Payload Analytics</label>
            <pre class="text-[10px] text-emerald-400/90 font-mono bg-black/60 p-4 rounded-lg overflow-x-auto max-h-[140px] scrollbar-thin scrollbar-thumb-slate-800 border border-slate-800/50"><code>{{ JSON.stringify(form.value, null, 2) }}</code></pre>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-6 border-t border-slate-800/50">
        <Button label="Annuler" class="p-button-text !text-slate-400 hover:!text-white transition-colors" @click="emit('update:visible', false)" />
        <Button 
          :label="product ? 'Mettre à jour' : 'Créer le Produit'" 
          class="!bg-indigo-600 !border-indigo-600 hover:!bg-indigo-500 shadow-xl shadow-indigo-600/20 px-6" 
          @click="onSave" 
          :loading="loading"
          :disabled="!form.name || !form.roblox_product_id"
        />
      </div>
    </div>
  </Dialog>
</template>
