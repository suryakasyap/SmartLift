import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
    name: string;
    setName: (name: string) => void;
    gender: 'Male' | 'Female' | 'Other';
    setGender: (val: 'Male' | 'Female' | 'Other') => void;
    units: 'Metrics' | 'Imperial';
    setUnits: (val: 'Metrics' | 'Imperial') => void;
    weekStart: 'Monday' | 'Sunday';
    setWeekStart: (val: 'Monday' | 'Sunday') => void;
    language: string;
    setLanguage: (val: string) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            name: 'User',
            setName: (name) => set({ name }),
            gender: 'Male',
            setGender: (gender) => set({ gender }),
            units: 'Metrics',
            setUnits: (units) => set({ units }),
            weekStart: 'Monday',
            setWeekStart: (weekStart) => set({ weekStart }),
            language: 'English',
            setLanguage: (language) => set({ language }),
        }),
        {
            name: 'user-storage',
        }
    )
);
