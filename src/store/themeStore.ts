import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_ACCENT_COLOR } from '../constants';

interface ThemeState {
  appColor: string;
  setAppColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      appColor: DEFAULT_ACCENT_COLOR,
      setAppColor: (appColor) => set({ appColor }),
    }),
    { name: 'theme-storage' },
  ),
);
