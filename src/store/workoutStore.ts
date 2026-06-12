import { create } from 'zustand';
import type { Exercise } from '../db/db';

interface WorkoutStoreState {
    // Workout Logic
    name: string;
    setName: (name: string) => void;

    isPlanned: boolean;
    setIsPlanned: (val: boolean) => void;

    planningType: 'week_days' | 'spacing';
    setPlanningType: (val: 'week_days' | 'spacing') => void;

    selectedDays: string[];
    setSelectedDays: (days: string[]) => void;

    spacingDays: number;
    setSpacingDays: (val: number) => void;

    reminderEnabled: boolean;
    setReminderEnabled: (val: boolean) => void;
    reminderTime: string;
    setReminderTime: (time: string) => void;
    timeFormat: '12h' | '24h';
    setTimeFormat: (format: '12h' | '24h') => void;

    // Customization
    color: string;
    setColor: (val: string) => void;
    targetSets: string;
    setTargetSets: (val: string) => void;
    repType: 'reps' | 'time';
    setRepType: (val: 'reps' | 'time') => void;
    restTime: number;
    setRestTime: (val: number) => void;

    cycleEnabled: boolean;
    setCycleEnabled: (val: boolean) => void;
    cycleCount: number;
    setCycleCount: (val: number) => void;

    exercises: Exercise[];
    addExercise: (exercise: Exercise) => void;
    removeExercise: (id: number) => void;
    updateExercise: (exercise: Exercise) => void;

    editingId: number | null;
    setEditingId: (id: number | null) => void;

    reset: () => void;
}

export const useWorkoutStore = create<WorkoutStoreState>((set) => ({
    name: '',
    setName: (name) => set({ name }),

    isPlanned: false,
    setIsPlanned: (isPlanned) => set({ isPlanned }),

    planningType: 'week_days',
    setPlanningType: (planningType) => set({ planningType }),

    selectedDays: [],
    setSelectedDays: (selectedDays) => set({ selectedDays }),

    spacingDays: 0,
    setSpacingDays: (spacingDays) => set({ spacingDays }),

    reminderEnabled: false,
    setReminderEnabled: (reminderEnabled) => set({ reminderEnabled }),
    reminderTime: '18:30',
    setReminderTime: (reminderTime) => set({ reminderTime }),
    timeFormat: '24h',
    setTimeFormat: (timeFormat) => set({ timeFormat }),

    color: '#F4A261', // Default orange/peach
    setColor: (color) => set({ color }),
    targetSets: '30-30-30',
    setTargetSets: (targetSets) => set({ targetSets }),
    repType: 'reps',
    setRepType: (repType) => set({ repType }),
    restTime: 180,
    setRestTime: (restTime) => set({ restTime }),

    cycleEnabled: false,
    setCycleEnabled: (cycleEnabled) => set({ cycleEnabled }),
    cycleCount: 3,
    setCycleCount: (cycleCount) => set({ cycleCount }),

    exercises: [],
    addExercise: (exercise) => set((state) => ({ exercises: [...state.exercises, exercise] })),
    removeExercise: (id: number) => set((state) => ({ exercises: state.exercises.filter(e => e.id !== id) })),
    updateExercise: (exercise: Exercise) => set((state) => ({ exercises: state.exercises.map(e => e.id === exercise.id ? exercise : e) })),

    editingId: null,
    setEditingId: (id) => set({ editingId: id }),

    reset: () => set({
        editingId: null,
        name: '',
        isPlanned: false,
        planningType: 'week_days',
        selectedDays: [],
        spacingDays: 0,
        reminderEnabled: false,
        reminderTime: '18:30',
        timeFormat: '24h',
        color: '#F4A261',
        targetSets: '30-30-30',
        repType: 'reps',
        restTime: 180,
        cycleEnabled: false,
        cycleCount: 3,
        exercises: []
    })
}));
