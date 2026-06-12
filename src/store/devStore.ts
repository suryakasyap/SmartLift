import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Developer tooling: lets the simulated "today" be overridden from Settings
 * so scheduling and streak logic can be tested without waiting for real days.
 */
interface DevState {
  /** ISO string of the simulated current date. */
  systemDate: string;
  getSystemDate: () => Date;
  setSystemDate: (date: Date) => void;
}

export const useDevStore = create<DevState>()(
  persist(
    (set, get) => ({
      systemDate: new Date().toISOString(),
      getSystemDate: () => new Date(get().systemDate),
      setSystemDate: (date) => set({ systemDate: date.toISOString() }),
    }),
    { name: 'dev-storage' },
  ),
);
