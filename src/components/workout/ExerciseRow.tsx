import { Hourglass, Play } from 'lucide-react';
import type { Exercise } from '../../db/db';

interface ExerciseRowProps {
  exercise: Exercise;
  onLog?: () => void;
}

/** Compact exercise line item with target info and an optional log action. */
export const ExerciseRow = ({ exercise, onLog }: ExerciseRowProps) => (
  <div className="flex items-center gap-4 py-3">
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: exercise.color ?? '#333333' }}
    >
      <span className="text-xs font-bold text-white/50">Img</span>
    </div>

    <div className="min-w-0 flex-1">
      <h4 className="truncate text-base font-bold text-white">{exercise.name}</h4>
      <div className="mt-0.5 flex items-center gap-2 text-xs font-bold tracking-wider text-zinc-500">
        {exercise.rep_type === 'time' ? (
          <span className="flex items-center gap-1">
            <Hourglass className="h-3 w-3" />
            {exercise.target_time}s
          </span>
        ) : (
          <span>{exercise.target_reps} reps</span>
        )}
      </div>
    </div>

    {exercise.target_weight > 0 && (
      <div className="mr-2 text-xs font-bold text-zinc-500">{exercise.target_weight}kg</div>
    )}

    {onLog && (
      <button
        onClick={(event) => {
          event.stopPropagation();
          onLog();
        }}
        aria-label={`Log ${exercise.name}`}
        className="shrink-0 rounded-full bg-zinc-800 p-3 text-white transition-colors hover:bg-zinc-700"
      >
        <Play className="h-4 w-4 fill-white" />
      </button>
    )}
  </div>
);
