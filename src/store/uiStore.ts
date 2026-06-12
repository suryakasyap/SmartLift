import { create } from 'zustand';
import type { Exercise } from '../db/db';

interface UiState {
  isWorkoutSheetOpen: boolean;
  isExerciseSheetOpen: boolean;
  /** Exercise pre-filling the exercise sheet, or null when creating a new one. */
  exerciseBeingEdited: Exercise | null;
  openWorkoutSheet: () => void;
  closeWorkoutSheet: () => void;
  openExerciseSheet: (exercise?: Exercise) => void;
  closeExerciseSheet: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isWorkoutSheetOpen: false,
  isExerciseSheetOpen: false,
  exerciseBeingEdited: null,
  openWorkoutSheet: () => set({ isWorkoutSheetOpen: true }),
  closeWorkoutSheet: () => set({ isWorkoutSheetOpen: false }),
  openExerciseSheet: (exercise) =>
    set({ isExerciseSheetOpen: true, exerciseBeingEdited: exercise ?? null }),
  closeExerciseSheet: () =>
    set({ isExerciseSheetOpen: false, exerciseBeingEdited: null }),
}));
