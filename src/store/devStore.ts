import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DevState {
    systemDate: string; // ISO String
    getSystemDate: () => Date;
    setSystemDate: (date: Date) => void;
    resetSystemDate: () => void;
    isDevMode: boolean;
    toggleDevMode: () => void;
}

export const useDevStore = create<DevState>()(
    persist(
        (set, get) => ({
            systemDate: new Date().toISOString(),
            getSystemDate: () => new Date(get().systemDate),
            setSystemDate: (date) => set({ systemDate: date.toISOString() }),
            resetSystemDate: () => set({ systemDate: new Date().toISOString() }),
            isDevMode: false,
            toggleDevMode: () => set((state) => ({ isDevMode: !state.isDevMode })),
        }),
        {
            name: 'dev-storage',
            // Default storage is localStorage, which works fine for strings.
        }
    )
);
