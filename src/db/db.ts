import Dexie, { type EntityTable } from 'dexie';

export type PlanningType = 'week_days' | 'spacing' | 'never';
export type RepType = 'reps' | 'time';
export type TimeFormat = '12h' | '24h';
export type UnitSystem = 'Metrics' | 'Imperial';

export interface Workout {
  id: number;
  name: string;
  planning_type: PlanningType;
  /** Selected days when planning_type is 'week_days', e.g. ['Monday', 'Friday']. */
  week_days: string[];
  /** Rest days between sessions when planning_type is 'spacing'. */
  spacing_days: number;
  /** Anchor date used to project the spacing schedule forward. */
  first_workout_date?: Date;
  /** Reminder in 24h "HH:MM" format; absent when reminders are off. */
  reminder_time?: string;
  /** Hex accent colour for this workout. */
  color?: string;
  cycle_enabled: boolean;
  cycle_count?: number;
  /** Rest between sets, in seconds. */
  rest_time: number;
}

export interface Exercise {
  id: number;
  workoutId: number;
  name: string;
  /** Hex accent colour for this exercise. */
  color?: string;
  rep_type: RepType;
  target_reps: number;
  target_weight: number;
  /** Target duration in seconds; time-based exercises only. */
  target_time?: number;
  /** Target set count; time-based exercises only. */
  target_sets?: number;
  /** Comma-separated muscle group names. */
  muscle_group: string;
  /** Comma-separated equipment names. */
  equipment: string;
  is_home: boolean;
}

export interface LoggedSet {
  reps: string;
  weight: string;
}

export interface LoggedExercise {
  name: string;
  sets: LoggedSet[];
}

export interface WorkoutLog {
  id: number;
  workoutId: number;
  /** Name snapshot so history survives workout renames and deletions. */
  workoutName: string;
  date: Date;
  durationSeconds: number;
  /** Unit system active when the session was logged. */
  unit?: UnitSystem;
  exercises?: LoggedExercise[];
}

export const db = new Dexie('WorkoutTrackerDB') as Dexie & {
  workouts: EntityTable<Workout, 'id'>;
  exercises: EntityTable<Exercise, 'id'>;
  workoutLogs: EntityTable<WorkoutLog, 'id'>;
};

db.version(1).stores({
  workouts: '++id, name',
  exercises: '++id, workoutId, name',
  workoutLogs: '++id, workoutId, date',
});
