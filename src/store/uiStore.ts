import { create } from 'zustand';

interface UIState {
    isCreateWorkoutOpen: boolean;
    isCreateExerciseOpen: boolean;
    setIsCreateWorkoutOpen: (isOpen: boolean) => void;
    setIsCreateExerciseOpen: (isOpen: boolean) => void;
    openCreateWorkout: () => void;
    closeCreateWorkout: () => void;
    openCreateExercise: () => void;
    closeCreateExercise: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isCreateWorkoutOpen: false,
    isCreateExerciseOpen: false,
    setIsCreateWorkoutOpen: (isOpen) => set({ isCreateWorkoutOpen: isOpen }),
    setIsCreateExerciseOpen: (isOpen) => set({ isCreateExerciseOpen: isOpen }),
    openCreateWorkout: () => set({ isCreateWorkoutOpen: true }),
    closeCreateWorkout: () => set({ isCreateWorkoutOpen: false }),
    openCreateExercise: () => set({ isCreateExerciseOpen: true }),
    closeCreateExercise: () => set({ isCreateExerciseOpen: false }),
}));
