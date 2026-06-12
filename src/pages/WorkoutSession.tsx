import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Clock, Activity, XCircle, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TimeCounter } from '../components/ui/TimeCounter';
import { db, type LoggedSet, type WorkoutLog } from '../db/db';
import { useThemeStore } from '../store/themeStore';
import { useDevStore } from '../store/devStore';
import { useUserStore } from '../store/userStore';
import { formatRestTime, hmsToSeconds, secondsToHms } from '../lib/datetime';
import { cn } from '../lib/utils';

interface SetEntry {
  id: number;
  reps: string;
  weight: string;
}

interface SessionRouteState {
  /** Jump straight to this exercise instead of the workout's first one. */
  exerciseId?: number;
  /** Present when editing an existing log from the History page. */
  editLogId?: number;
  prefillSets?: LoggedSet[];
  exerciseName?: string;
}

/**
 * Live logging screen for a single exercise: set list with reps/weight (or
 * time for time-based exercises), then saved as a workout log.
 */
export default function WorkoutSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const workoutId = id ? parseInt(id, 10) : 0;
  const { exerciseId, editLogId, prefillSets, exerciseName }: SessionRouteState =
    location.state ?? {};

  const workout = useLiveQuery(() => db.workouts.get(workoutId), [workoutId]);
  const exercises = useLiveQuery(
    () => db.exercises.where('workoutId').equals(workoutId).toArray(),
    [workoutId],
  );
  const { appColor } = useThemeStore();
  const { getSystemDate } = useDevStore();
  const { units } = useUserStore();

  const [sets, setSets] = useState<SetEntry[]>(() => {
    if (prefillSets && prefillSets.length > 0) {
      return prefillSets.map((set, index) => ({ id: index + 1, ...set }));
    }
    return [{ id: 1, reps: '', weight: '' }];
  });
  const [isWarmupEnabled, setIsWarmupEnabled] = useState(true);

  if (!workout) return <div className="p-6 text-white">Loading...</div>;

  const activeExercise = exercises?.find((exercise) => exercise.id === exerciseId) ?? exercises?.[0];
  const currentExerciseName = activeExercise?.name ?? 'Exercise';
  const isTimeBased = activeExercise?.rep_type === 'time';
  const gridColumns = isTimeBased ? 'grid-cols-[40px_1fr_36px]' : 'grid-cols-[40px_1fr_1fr_36px]';

  const updateSet = (setId: number, patch: Partial<SetEntry>) => {
    setSets((current) =>
      current.map((set) => (set.id === setId ? { ...set, ...patch } : set)),
    );
  };

  const addSet = () => {
    setSets((current) => [...current, { id: Date.now(), reps: '', weight: '' }]);
  };

  const deleteSet = (setId: number) => {
    setSets((current) => (current.length > 1 ? current.filter((set) => set.id !== setId) : current));
  };

  const handleFinish = async () => {
    const log: Omit<WorkoutLog, 'id'> = {
      workoutId: workout.id,
      workoutName: workout.name,
      date: getSystemDate(),
      durationSeconds: 0,
      exercises: [
        {
          name: exerciseName ?? currentExerciseName,
          sets: sets.map(({ reps, weight }) => ({ reps, weight })),
        },
      ],
      unit: units,
    };

    if (editLogId) {
      await db.workoutLogs.update(editLogId, log);
    } else {
      await db.workoutLogs.add(log as WorkoutLog);
    }

    navigate(-1);
  };

  const setInputClassName =
    'w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-center text-base font-bold text-white placeholder-zinc-700 transition-colors focus:border-white focus:outline-none';

  return (
    <div className="flex min-h-screen flex-col bg-background p-4 text-white">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-accent">{currentExerciseName}</h1>
        <button onClick={() => navigate(-1)} aria-label="Close" className="text-zinc-400 transition-colors hover:text-white">
          <XCircle className="h-8 w-8 opacity-50 transition-opacity hover:opacity-100" />
        </button>
      </header>

      <div className="mb-6 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-white">
          <Clock className="h-3 w-3" />
          {formatRestTime(workout.rest_time || 180)} rest
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-400">Warm-up</span>
          <div
            className={cn(
              'relative h-5 w-10 cursor-pointer rounded-full transition-colors',
              isWarmupEnabled ? 'bg-zinc-700' : 'bg-zinc-800',
            )}
            onClick={() => setIsWarmupEnabled((enabled) => !enabled)}
          >
            <div
              className={cn(
                'absolute top-1 h-3 w-3 rounded-full transition-all',
                isWarmupEnabled ? 'left-6 bg-accent' : 'left-1 bg-white',
              )}
            />
          </div>
        </div>
      </div>

      <div
        className={cn(
          'mb-3 grid gap-2 px-1 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500',
          gridColumns,
        )}
      >
        <div>Set</div>
        {isTimeBased ? (
          <div>Time (HH:MM:SS)</div>
        ) : (
          <>
            <div>Reps</div>
            <div>Weight</div>
          </>
        )}
        <div />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {sets.map((set, index) => (
          <div key={set.id} className={cn('grid items-center gap-2', gridColumns)}>
            <div className="flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-sm font-bold text-zinc-400">
                {isWarmupEnabled && index === 0 ? (
                  <Activity className="h-4 w-4" />
                ) : (
                  index + (isWarmupEnabled ? 0 : 1)
                )}
              </div>
            </div>

            {isTimeBased ? (
              <div className="flex justify-center">
                <TimeCounter
                  value={hmsToSeconds(set.reps)}
                  onChange={(seconds) =>
                    updateSet(set.id, { reps: secondsToHms(seconds), weight: '' })
                  }
                  accentColor={appColor}
                />
              </div>
            ) : (
              <>
                <input
                  type="number"
                  placeholder="0"
                  className={setInputClassName}
                  value={set.reps}
                  onChange={(event) => updateSet(set.id, { reps: event.target.value })}
                />
                <input
                  type="text"
                  placeholder="—"
                  className={setInputClassName}
                  value={set.weight}
                  onChange={(event) => updateSet(set.id, { weight: event.target.value })}
                />
              </>
            )}

            <button
              onClick={() => deleteSet(set.id)}
              disabled={sets.length <= 1}
              title="Delete set"
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                sets.length <= 1
                  ? 'cursor-not-allowed text-zinc-800'
                  : 'text-zinc-600 hover:bg-red-900/20 hover:text-red-400',
              )}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mb-8 mt-2">
        <button
          onClick={addSet}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 px-5 py-3 text-xs font-bold text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          + Add set
        </button>
      </div>

      <div className="mt-auto pb-6 pt-4">
        <Button
          fullWidth
          onClick={handleFinish}
          className="rounded-full bg-accent py-4 text-lg text-white shadow-lg"
        >
          Log Workout
        </Button>
      </div>
    </div>
  );
}
