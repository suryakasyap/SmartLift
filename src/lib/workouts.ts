import { db, type Exercise, type Workout } from '../db/db';
import type { WorkoutDraft } from '../store/workoutStore';

/**
 * Persists a workout draft and its exercises. Creates a new workout when
 * `editingId` is null; otherwise updates the existing one and replaces its
 * exercises with the draft's list.
 */
export async function saveWorkout(
  draft: WorkoutDraft,
  exercises: Exercise[],
  editingId: number | null,
): Promise<void> {
  const workout: Omit<Workout, 'id'> = {
    name: draft.name,
    planning_type: draft.isPlanned ? draft.planningType : 'never',
    week_days: draft.selectedDays,
    spacing_days: draft.spacingDays,
    first_workout_date: draft.planningType === 'spacing' ? new Date() : undefined,
    reminder_time: draft.reminderEnabled ? draft.reminderTime : undefined,
    cycle_enabled: draft.cycleEnabled,
    cycle_count: draft.cycleEnabled ? draft.cycleCount : undefined,
    rest_time: draft.restTime,
    color: draft.color,
  };

  let workoutId = editingId;
  if (editingId) {
    await db.workouts.update(editingId, workout);
    await db.exercises.where('workoutId').equals(editingId).delete();
  } else {
    workoutId = await db.workouts.add(workout);
  }

  if (workoutId && exercises.length > 0) {
    // Draft exercises carry temporary ids; strip them so Dexie assigns real ones.
    await db.exercises.bulkAdd(
      exercises.map((exercise) => {
        const copy: Partial<Exercise> = { ...exercise, workoutId };
        delete copy.id;
        return copy as Omit<Exercise, 'id'>;
      }),
    );
  }
}

/** Deletes a workout along with its exercises and history. */
export async function deleteWorkout(workoutId: number): Promise<void> {
  await db.workouts.delete(workoutId);
  await db.exercises.where('workoutId').equals(workoutId).delete();
  await db.workoutLogs.where('workoutId').equals(workoutId).delete();
}
