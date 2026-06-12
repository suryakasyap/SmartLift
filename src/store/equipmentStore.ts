import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EquipmentState {
  /** Ids of the equipment the user owns; see EQUIPMENT_OPTIONS in constants. */
  selectedEquipment: string[];
  toggleEquipment: (id: string) => void;
}

export const useEquipmentStore = create<EquipmentState>()(
  persist(
    (set) => ({
      selectedEquipment: [],
      toggleEquipment: (id) =>
        set((state) => ({
          selectedEquipment: state.selectedEquipment.includes(id)
            ? state.selectedEquipment.filter((existing) => existing !== id)
            : [...state.selectedEquipment, id],
        })),
    }),
    { name: 'equipment-storage' },
  ),
);
