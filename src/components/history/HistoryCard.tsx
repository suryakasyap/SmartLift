import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  RefreshCcw,
  Dumbbell,
  Flame,
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { db, type WorkoutLog } from '../../db/db';
import { useThemeStore } from '../../store/themeStore';
import { useUserStore } from '../../store/userStore';
import { convertWeight } from '../../lib/units';
import { cn } from '../../lib/utils';

interface HistoryCardProps {
  log: WorkoutLog;
  isGridView: boolean;
}

/** A logged session: header with date/actions plus one stat card per exercise. */
export const HistoryCard = ({ log, isGridView }: HistoryCardProps) => {
  const { appColor } = useThemeStore();
  const { units } = useUserStore();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // The workout and its exercises drive the accent colours; both may have
  // been deleted since the session was logged.
  const workout = useLiveQuery(() => db.workouts.get(log.workoutId), [log.workoutId]);
  const workoutExercises = useLiveQuery(
    () => db.exercises.where('workoutId').equals(log.workoutId).toArray(),
    [log.workoutId],
  );

  const dateLabel = new Date(log.date).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  // Legacy logs without per-exercise data fall back to a simple summary card.
  if (!log.exercises || log.exercises.length === 0) {
    return (
      <div className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-start justify-between">
          <h3
            className="text-xl font-bold tracking-tight"
            style={{ color: workout?.color ?? appColor }}
          >
            {log.workoutName || 'Workout'}
          </h3>
          <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-500">
            {dateLabel}
          </span>
        </div>
        <div className="text-sm font-medium text-zinc-400">
          {Math.floor(log.durationSeconds / 60)} min session
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    const exercise = log.exercises![0];
    navigate(`/workout/${log.workoutId}`, {
      state: {
        editLogId: log.id,
        prefillSets: exercise.sets,
        exerciseName: exercise.name,
      },
    });
  };

  return (
    <div className={cn('flex flex-col', isGridView ? 'space-y-1' : 'space-y-4')}>
      <div className={cn('flex items-center gap-2 px-2', isGridView ? 'mb-0' : 'mb-2')}>
        <CalendarIcon
          className={cn('flex-shrink-0 text-zinc-500', isGridView ? 'h-3 w-3' : 'h-4 w-4')}
        />
        <div
          className={cn(
            'flex flex-1 items-center overflow-hidden',
            isGridView ? 'gap-1 text-[10px]' : 'gap-2 text-sm',
          )}
        >
          <span className="whitespace-nowrap font-bold text-zinc-400">{dateLabel}</span>
          <span className="flex-shrink-0 text-xs text-zinc-600">•</span>
          <span className="min-w-0 truncate font-bold text-zinc-400" title={log.workoutName}>
            {log.workoutName}
          </span>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            onClick={handleEdit}
            title="Edit log"
            className={cn(
              'group flex items-center justify-center rounded-full transition-colors hover:bg-zinc-800',
              isGridView ? 'h-5 w-5' : 'h-7 w-7',
            )}
          >
            <Pencil
              className={cn(
                'text-zinc-500 transition-colors group-hover:text-white',
                isGridView ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5',
              )}
            />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete log"
            className={cn(
              'group flex items-center justify-center rounded-full transition-colors hover:bg-zinc-800',
              isGridView ? 'h-5 w-5' : 'h-7 w-7',
            )}
          >
            <Trash2
              className={cn(
                'text-zinc-500 transition-colors group-hover:text-red-400',
                isGridView ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5',
              )}
            />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete this log?"
        description="This action cannot be undone."
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          await db.workoutLogs.delete(log.id);
          setShowDeleteConfirm(false);
        }}
      />

      <div className="grid grid-cols-1 gap-4">
        {log.exercises.map((exercise, index) => {
          const repsLabel = exercise.sets.map((set) => set.reps).join('-');
          // Weights are converted from the unit system used at logging time.
          const weightsLabel = exercise.sets
            .map((set) =>
              Math.round(convertWeight(parseFloat(set.weight) || 0, log.unit, units)),
            )
            .join('-');

          const maxReps = Math.max(...exercise.sets.map((set) => parseInt(set.reps) || 0));
          const maxWeight = Math.round(
            convertWeight(
              Math.max(...exercise.sets.map((set) => parseFloat(set.weight) || 0)),
              log.unit,
              units,
            ),
          );

          // Accent priority: exercise colour > workout colour > app colour.
          const exerciseDef = workoutExercises?.find((def) => def.name === exercise.name);
          const accentColor = exerciseDef?.color ?? workout?.color ?? appColor;

          return (
            <div
              key={index}
              className={cn(
                'relative flex flex-col justify-between overflow-hidden border border-zinc-800 bg-zinc-900',
                isGridView ? 'aspect-square rounded-[24px] p-4' : 'rounded-[32px] p-6',
              )}
            >
              <h3
                className={cn(
                  'font-bold transition-all',
                  isGridView ? 'mb-2 text-lg leading-tight' : 'mb-6 text-2xl',
                )}
                style={{ color: accentColor }}
              >
                {exercise.name}
              </h3>

              {!isGridView && <p className="mb-4 text-sm font-bold text-zinc-500">Session Stats</p>}

              <div className={isGridView ? 'space-y-2' : 'space-y-6'}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <RefreshCcw className="h-4 w-4" />
                    <span
                      className={cn(
                        'font-mono tracking-wider text-zinc-300',
                        isGridView ? 'text-sm' : 'text-lg',
                      )}
                    >
                      {repsLabel || '0'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        'block font-bold leading-none text-white',
                        isGridView ? 'text-lg' : 'text-2xl',
                      )}
                    >
                      {maxReps}
                    </span>
                    <span
                      className="mt-0.5 block text-[8px] font-bold uppercase tracking-widest"
                      style={{ color: accentColor }}
                    >
                      Max Reps
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Dumbbell className="h-4 w-4" />
                    <span
                      className={cn(
                        'font-mono tracking-wider text-zinc-300',
                        isGridView ? 'text-sm' : 'text-lg',
                      )}
                    >
                      {weightsLabel || '0'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        'block font-bold leading-none text-white',
                        isGridView ? 'text-lg' : 'text-2xl',
                      )}
                    >
                      {maxWeight}
                    </span>
                    <span
                      className="mt-0.5 block text-[8px] font-bold uppercase tracking-widest"
                      style={{ color: accentColor }}
                    >
                      Max {units === 'Imperial' ? 'Lbs' : 'Kg'}
                    </span>
                  </div>
                </div>

                <div className={cn('flex items-center gap-2', isGridView ? 'pt-1' : 'pt-2')}>
                  <span className={cn('font-bold text-white', isGridView ? 'text-xl' : 'text-3xl')}>
                    {exercise.sets.length}
                  </span>
                  <Flame
                    className={isGridView ? 'h-4 w-4' : 'h-6 w-6'}
                    style={{ color: accentColor, fill: accentColor }}
                  />
                  <span className="ml-1 text-xs font-bold uppercase text-zinc-600">Sets</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
