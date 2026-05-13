import { ref } from 'vue';
import type { Faction } from '@/types/admin.types';

export function useFactionModals() {
  const isFormModalOpen = ref(false);
  const selectedFaction = ref<Faction | null>(null);

  const openCreateModal = () => {
    selectedFaction.value = null;
    isFormModalOpen.value = true;
  };

  const openEditModal = (faction: Faction) => {
    selectedFaction.value = { ...faction };
    isFormModalOpen.value = true;
  };

  const closeFormModal = () => {
    isFormModalOpen.value = false;
    selectedFaction.value = null;
  };

  return {
    isFormModalOpen,
    selectedFaction,
    openCreateModal,
    openEditModal,
    closeFormModal,
  };
}
