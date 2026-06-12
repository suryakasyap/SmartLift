import type { Workout } from '../db/db';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const startOfDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

/** Returns true when the workout's plan puts it on the given calendar day. */
export function isWorkoutScheduled(workout: Workout, date: Date): boolean {
  if (workout.planning_type === 'week_days') {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return workout.week_days.includes(dayName);
  }

  if (
    workout.planning_type === 'spacing' &&
    workout.first_workout_date &&
    workout.spacing_days >= 0
  ) {
    const start = startOfDay(new Date(workout.first_workout_date));
    const current = startOfDay(date);
    const daysSinceStart = Math.floor((current.getTime() - start.getTime()) / MS_PER_DAY);

    if (daysSinceStart < 0) return false;
    return daysSinceStart % (workout.spacing_days + 1) === 0;
  }

  return false;
}
