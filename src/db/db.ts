import Dexie, { type EntityTable } from 'dexie';

export interface Workout {
    id: number;
    name: string;
    planning_type: 'week_days' | 'spacing' | 'never';

    // Planning details
    week_days: string[]; // e.g. ['Monday', 'Wednesday']
    spacing_days: number; // e.g. 2
    first_workout_date?: Date; // For spacing calculation

    reminder_time?: string; // "18:30"

    // Customization
    color?: string; // Hex or generic name
    target_sets?: string; // "30-30-30" or "3x12"
    rep_type?: 'reps' | 'time';

    cycle_enabled: boolean;
    cycle_count?: number; // Number of cycles
    rest_time: number; // in seconds
}

export interface Exercise {
    id: number;
    workoutId: number;
    name: string;

    illustration?: string; // URL or blob?
    color?: string; // Hex color for UI
    rep_type: 'reps' | 'time';
    target_reps: number;
    target_weight: number; // kg/lbs
    target_time?: number; // seconds (for time-based exercises)
    muscle_group: string;
    equipment: string;
    is_home: boolean;
}

const db = new Dexie('WorkoutTrackerDB') as Dexie & {
    workouts: EntityTable<Workout, 'id'>;
    exercises: EntityTable<Exercise, 'id'>;
    workoutLogs: EntityTable<WorkoutLog, 'id'>;
};

export interface WorkoutLog {
    id: number;
    workoutId: number;
    workoutName: string; // Store name snapshot
    date: Date;
    durationSeconds: number;
    unit?: 'Metrics' | 'Imperial'; // Snapshot of the unit used during the session
    exercises?: {
        name: string;
        sets: { reps: string; weight: string }[];
    }[];
}

// Schema registration
db.version(1).stores({
    workouts: '++id, name',
    exercises: '++id, workoutId, name',
    workoutLogs: '++id, workoutId, date'
});

export { db };
