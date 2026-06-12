import type { Workout } from '../db/db';

export const isWorkoutScheduled = (workout: Workout, date: Date): boolean => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

    if (workout.planning_type === 'week_days') {
        return workout.week_days.includes(dayName);
    }

    if (workout.planning_type === 'spacing' && workout.first_workout_date && workout.spacing_days >= 0) {
        const start = new Date(workout.first_workout_date);
        start.setHours(0, 0, 0, 0);
        const current = new Date(date);
        current.setHours(0, 0, 0, 0);

        const diffTime = current.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return false;

        return diffDays % (workout.spacing_days + 1) === 0;
    }

    return false;
};
