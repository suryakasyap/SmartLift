import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    appColor: string;
    setAppColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            appColor: '#f97316', // Default Orange
            setAppColor: (appColor) => set({ appColor }),
        }),
        {
            name: 'theme-storage',
        }
    )
);
