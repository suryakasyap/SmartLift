import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EquipmentType {
    id: string;
    name: string;
}

// Available equipment options
export const EQUIPMENT_OPTIONS: EquipmentType[] = [
    { id: 'bodyweight', name: 'Bodyweight' },
    { id: 'machines', name: 'Machines' },
    { id: 'barbells', name: 'Barbells' },
    { id: 'dumbbell', name: 'Dumbbell' },
    { id: 'cable', name: 'Cable' },
    { id: 'kettlebell', name: 'Kettlebell' },
    { id: 'suspension', name: 'Suspension' },
    { id: 'resistance_band', name: 'Resistance Band' },
    { id: 'medicine_ball', name: 'Medicine Ball' },
    { id: 'roller', name: 'Roller' },
    { id: 'bosu_ball', name: 'Bosu Ball' },
    { id: 'stability_ball', name: 'Stability Ball' },
    { id: 'rope', name: 'Rope' },
    { id: 'stick', name: 'Stick' },
    { id: 'cardio', name: 'Cardio' },
    { id: 'other', name: 'Other' },
];

interface EquipmentState {
    selectedEquipment: string[]; // Array of equipment IDs
    toggleEquipment: (id: string) => void;
    isSelected: (id: string) => boolean;
}

export const useEquipmentStore = create<EquipmentState>()(
    persist(
        (set, get) => ({
            selectedEquipment: [],
            toggleEquipment: (id) => set((state) => ({
                selectedEquipment: state.selectedEquipment.includes(id)
                    ? state.selectedEquipment.filter(e => e !== id)
                    : [...state.selectedEquipment, id]
            })),
            isSelected: (id) => get().selectedEquipment.includes(id),
        }),
        {
            name: 'equipment-storage',
        }
    )
);
