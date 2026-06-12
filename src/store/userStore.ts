import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UnitSystem } from '../db/db';

export type Gender = 'Male' | 'Female' | 'Other';
export type WeekStart = 'Monday' | 'Sunday';

interface UserState {
  name: string;
  gender: Gender;
  units: UnitSystem;
  weekStart: WeekStart;
  language: string;
  setName: (name: string) => void;
  setGender: (gender: Gender) => void;
  setUnits: (units: UnitSystem) => void;
  setWeekStart: (weekStart: WeekStart) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: 'User',
      gender: 'Male',
      units: 'Metrics',
      weekStart: 'Monday',
      language: 'English',
      setName: (name) => set({ name }),
      setGender: (gender) => set({ gender }),
      setUnits: (units) => set({ units }),
      setWeekStart: (weekStart) => set({ weekStart }),
    }),
    { name: 'user-storage' },
  ),
);
