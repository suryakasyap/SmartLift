import { create } from 'zustand';
import type { Exercise, PlanningType, TimeFormat, Workout } from '../db/db';
import {
  DEFAULT_ACCENT_COLOR,
  DEFAULT_CYCLE_COUNT,
  DEFAULT_REMINDER_TIME,
  DEFAULT_REST_SECONDS,
} from '../constants';

/** Form state for the workout being created or edited. */
export interface WorkoutDraft {
  name: string;
  isPlanned: boolean;
  planningType: Exclude<PlanningType, 'never'>;
  selectedDays: string[];
  spacingDays: number;
  reminderEnabled: boolean;
  reminderTime: string;
  timeFormat: TimeFormat;
  color: string;
  restTime: number;
  cycleEnabled: boolean;
  cycleCount: number;
}

interface WorkoutDraftState extends WorkoutDraft {
  exercises: Exercise[];
  /** Id of the workout being edited, or null when creating a new one. */
  editingId: number | null;
  updateDraft: (patch: Partial<WorkoutDraft>) => void;
  addExercise: (exercise: Exercise) => void;
  updateExercise: (exercise: Exercise) => void;
  removeExercise: (id: number) => void;
  /** Hydrates the draft from an existing workout for editing. */
  loadWorkout: (workout: Workout, exercises: Exercise[], fallbackColor: string) => void;
  reset: () => void;
}

const initialDraft: WorkoutDraft = {
  name: '',
  isPlanned: false,
  planningType: 'week_days',
  selectedDays: [],
  spacingDays: 0,
  reminderEnabled: false,
  reminderTime: DEFAULT_REMINDER_TIME,
  timeFormat: '24h',
  color: DEFAULT_ACCENT_COLOR,
  restTime: DEFAULT_REST_SECONDS,
  cycleEnabled: false,
  cycleCount: DEFAULT_CYCLE_COUNT,
};

export const useWorkoutStore = create<WorkoutDraftState>((set) => ({
  ...initialDraft,
  exercises: [],
  editingId: null,

  updateDraft: (patch) => set(patch),

  addExercise: (exercise) =>
    set((state) => ({ exercises: [...state.exercises, exercise] })),

  updateExercise: (exercise) =>
    set((state) => ({
      exercises: state.exercises.map((existing) =>
        existing.id === exercise.id ? exercise : existing,
      ),
    })),

  removeExercise: (id) =>
    set((state) => ({
      exercises: state.exercises.filter((exercise) => exercise.id !== id),
    })),

  loadWorkout: (workout, exercises, fallbackColor) =>
    set({
      editingId: workout.id,
      name: workout.name,
      isPlanned: workout.planning_type !== 'never',
      planningType: workout.planning_type === 'spacing' ? 'spacing' : 'week_days',
      selectedDays: workout.week_days ?? [],
      spacingDays: workout.spacing_days ?? 0,
      reminderEnabled: Boolean(workout.reminder_time),
      reminderTime: workout.reminder_time ?? DEFAULT_REMINDER_TIME,
      cycleEnabled: workout.cycle_enabled,
      cycleCount: workout.cycle_count ?? DEFAULT_CYCLE_COUNT,
      color: workout.color ?? fallbackColor,
      restTime: workout.rest_time ?? DEFAULT_REST_SECONDS,
      exercises,
    }),

  reset: () => set({ ...initialDraft, exercises: [], editingId: null }),
}));
