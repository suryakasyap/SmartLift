import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Clock, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CalendarGrid } from '../components/workout/CalendarGrid';
import { WorkoutCard } from '../components/workout/WorkoutCard';
import { ExerciseRow } from '../components/workout/ExerciseRow';
import { db, type Exercise, type Workout } from '../db/db';
import { useUserStore } from '../store/userStore';
import { useDevStore } from '../store/devStore';
import { useUiStore } from '../store/uiStore';
import { isWorkoutScheduled } from '../lib/scheduler';
import { deleteWorkout } from '../lib/workouts';
import { useCountUp } from '../hooks/useCountUp';

const STREAK_LOOKBACK_DAYS = 365;

/**
 * Consecutive training-day streak ending today. Days with nothing planned
 * don't break the streak; a missed planned day does. Today only counts
 * when completed but never breaks the streak.
 */
function calculateStreak(workouts: Workout[], completedDates: Set<string>, today: Date): number {
  let streak = 0;

  for (let daysAgo = 0; daysAgo < STREAK_LOOKBACK_DAYS; daysAgo++) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);

    if (completedDates.has(date.toDateString())) {
      streak++;
    } else if (daysAgo > 0 && workouts.some((workout) => isWorkoutScheduled(workout, date))) {
      break;
    }
  }

  return streak;
}

/** One scheduled workout with the exercises still left to log today. */
const TodayWorkoutSection = ({
  workout,
  loggedExerciseNames,
}: {
  workout: Workout;
  loggedExerciseNames: Set<string>;
}) => {
  const navigate = useNavigate();
  const exercises = useLiveQuery(
    () => db.exercises.where('workoutId').equals(workout.id).toArray(),
    [workout.id],
  );

  if (!exercises) return null;

  const remaining = exercises.filter((exercise) => !loggedExerciseNames.has(exercise.name));
  if (remaining.length === 0) return null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xl font-bold">{workout.name}</h2>
        <div className="flex items-center gap-1.5 text-zinc-500">
          <Clock className="h-4 w-4" />
          <span className="font-mono text-xs font-bold">{workout.reminder_time ?? '45:00'}</span>
        </div>
      </div>
      <div className="mb-4 border border-dashed border-zinc-800" />
      <div className="divide-y divide-zinc-800/50">
        {remaining.map((exercise: Exercise) => (
          <ExerciseRow
            key={exercise.id}
            exercise={exercise}
            onLog={() =>
              navigate(`/workout/${workout.id}`, { state: { exerciseId: exercise.id } })
            }
          />
        ))}
      </div>
    </div>
  );
};

/** Row in the "My Workouts" tab with edit and delete actions. */
const WorkoutListItem = ({ workout }: { workout: Workout }) => {
  const navigate = useNavigate();

  const scheduleLabel =
    workout.planning_type === 'week_days'
      ? workout.week_days.map((day) => day.slice(0, 3).toUpperCase()).join(', ')
      : workout.planning_type === 'spacing'
        ? `Every ${workout.spacing_days} days`
        : 'Not planned';

  return (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700">
      <div>
        <h3 className="mb-1 font-bold text-white">{workout.name}</h3>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
          {scheduleLabel}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/create-workout', { state: { workout } })}
          aria-label={`Edit ${workout.name}`}
          className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={async () => {
            if (confirm(`Delete "${workout.name}"?`)) {
              await deleteWorkout(workout.id);
            }
          }}
          aria-label={`Delete ${workout.name}`}
          className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const workouts = useLiveQuery(() => db.workouts.toArray());
  const logs = useLiveQuery(() => db.workoutLogs.toArray());

  const [activeTab, setActiveTab] = useState<'today' | 'workouts'>('today');

  const { name } = useUserStore();
  const { getSystemDate } = useDevStore();
  const openWorkoutSheet = useUiStore((state) => state.openWorkoutSheet);

  const systemDate = getSystemDate();
  const today = useMemo(() => new Date(systemDate), [systemDate]);
  const todayKey = today.toDateString();

  const todayWorkouts = useMemo(
    () => (workouts ?? []).filter((workout) => isWorkoutScheduled(workout, today)),
    [workouts, today],
  );

  const todayLogs = useMemo(
    () => (logs ?? []).filter((log) => new Date(log.date).toDateString() === todayKey),
    [logs, todayKey],
  );

  // Workouts already logged today drop out of the queue.
  const remainingWorkouts = useMemo(() => {
    const completedIds = new Set(todayLogs.map((log) => log.workoutId));
    return todayWorkouts.filter((workout) => !completedIds.has(workout.id));
  }, [todayWorkouts, todayLogs]);

  const activeWorkout = remainingWorkouts[0] ?? null;

  // Exercise names already logged today, grouped per workout.
  const loggedExercisesByWorkout = useMemo(() => {
    const byWorkout = new Map<number, Set<string>>();
    for (const log of todayLogs) {
      const names = byWorkout.get(log.workoutId) ?? new Set<string>();
      log.exercises?.forEach((exercise) => names.add(exercise.name));
      byWorkout.set(log.workoutId, names);
    }
    return byWorkout;
  }, [todayLogs]);

  const streak = useMemo(() => {
    if (!logs || !workouts) return 0;
    const completedDates = new Set(logs.map((log) => new Date(log.date).toDateString()));
    const start = new Date(systemDate);
    start.setHours(0, 0, 0, 0);
    return calculateStreak(workouts, completedDates, start);
  }, [logs, workouts, systemDate]);

  const animatedStreak = useCountUp(streak);

  const hasWorkouts = workouts && workouts.length > 0;

  return (
    <div className="min-h-screen bg-background p-6 pb-24 text-white">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hey, {name}</h1>
          <p className="mt-1 font-semibold text-zinc-400">
            You are on a <span className="font-bold text-accent">{animatedStreak} days streak.</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          aria-label="Settings"
          className="mt-4 cursor-pointer text-zinc-400 transition-colors hover:text-white"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2L20.6603 7V17L12 22L3.33975 17V7L12 2ZM12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5Z"
            />
          </svg>
        </button>
      </header>

      <div className="mb-8">
        <CalendarGrid workouts={workouts} logs={logs} />
      </div>

      {!hasWorkouts ? (
        <div className="mt-10 flex flex-col items-center justify-center space-y-4">
          <h2 className="text-xl font-bold">No workout</h2>
          <p className="px-6 text-center text-sm text-zinc-500">
            You don't have any workout. Create your first workout and start training.
          </p>
          <Button
            className="mt-4 rounded-full bg-white px-8 py-3 text-sm font-bold text-black hover:bg-gray-200"
            onClick={openWorkoutSheet}
          >
            Create workout
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'today' && (
            <div>
              {todayWorkouts.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-[32px] border border-dashed border-zinc-800 bg-zinc-900 p-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">Rest Day</p>
                    <p className="text-xs text-zinc-500">No workouts scheduled for today.</p>
                  </div>
                </div>
              ) : activeWorkout ? (
                <WorkoutCard
                  workout={activeWorkout}
                  date={today}
                  onTrain={() => navigate(`/workout/${activeWorkout.id}`)}
                  queueLabel={
                    todayWorkouts.length > 1
                      ? `${todayWorkouts.length - remainingWorkouts.length + 1} of ${todayWorkouts.length}`
                      : undefined
                  }
                />
              ) : (
                <div className="flex h-32 items-center justify-center rounded-[32px] border border-zinc-800 bg-zinc-900 p-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-accent">All Done! 🎉</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {todayWorkouts.length} workout{todayWorkouts.length > 1 ? 's' : ''} completed
                      today.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <div className="mb-6 flex items-center gap-6 border-b border-zinc-800/50 pb-2">
              {(
                [
                  { id: 'today', label: 'Today' },
                  { id: 'workouts', label: 'My Workouts' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    activeTab === tab.id
                      ? '-mb-2.5 border-b-2 border-white pb-2 text-lg font-bold text-white transition-colors'
                      : '-mb-2.5 pb-2 text-lg font-bold text-zinc-500 transition-colors hover:text-zinc-300'
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'today' ? (
              todayWorkouts.length > 0 ? (
                <div className="space-y-8">
                  {todayWorkouts.map((workout) => (
                    <TodayWorkoutSection
                      key={workout.id}
                      workout={workout}
                      loggedExerciseNames={
                        loggedExercisesByWorkout.get(workout.id) ?? new Set()
                      }
                    />
                  ))}

                  <Button
                    variant="secondary"
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-white transition-colors hover:bg-zinc-700"
                    onClick={openWorkoutSheet}
                    aria-label="Create workout"
                  >
                    <span className="mb-1 text-2xl leading-none">+</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-zinc-900/30 py-8">
                  <p className="mb-4 text-sm text-zinc-500">No workout details for today.</p>
                  <Button
                    variant="secondary"
                    className="rounded-full bg-zinc-800 px-6 py-2 text-xs font-bold text-white hover:bg-zinc-700"
                    onClick={() => setActiveTab('workouts')}
                  >
                    Check My Workouts
                  </Button>
                </div>
              )
            ) : (
              <div className="space-y-3">
                {workouts?.map((workout) => (
                  <WorkoutListItem key={workout.id} workout={workout} />
                ))}
                <Button
                  className="mt-4 w-full rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-200"
                  onClick={openWorkoutSheet}
                >
                  + New Workout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
