import { ref } from 'vue';
import type { War } from '@/types/admin.types';

export function useWarModals() {
  const isFormModalOpen = ref(false);
  const isFinishModalOpen = ref(false);
  const selectedWar = ref<War | null>(null);

  const openCreateModal = () => {
    selectedWar.value = null;
    isFormModalOpen.value = true;
  };

  const openEditModal = (war: War) => {
    selectedWar.value = { ...war };
    isFormModalOpen.value = true;
  };

  const openFinishModal = (war: War) => {
    selectedWar.value = { ...war };
    isFinishModalOpen.value = true;
  };

  const closeFormModal = () => {
    isFormModalOpen.value = false;
    selectedWar.value = null;
  };

  const closeFinishModal = () => {
    isFinishModalOpen.value = false;
    selectedWar.value = null;
  };

  return {
    isFormModalOpen,
    isFinishModalOpen,
    selectedWar,
    openCreateModal,
    openEditModal,
    openFinishModal,
    closeFormModal,
    closeFinishModal,
  };
}
