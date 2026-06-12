import { ArrowRight } from 'lucide-react';
import type { Workout } from '../../db/db';

interface WorkoutCardProps {
  workout: Workout;
  date: Date;
  onTrain: () => void;
  /** Position within today's queue when several workouts are scheduled, e.g. "1 of 2". */
  queueLabel?: string;
}

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-md">
    {children}
  </span>
);

/** Hero card on the Home page inviting the user to start today's session. */
export const WorkoutCard = ({ workout, date, onTrain, queueLabel }: WorkoutCardProps) => {
  const dayOfMonth = date.getDate();
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

  return (
    <div className="relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-[32px] bg-gradient-to-br from-[#fabc7a] to-[#ff8e8e] p-4">
      <div className="relative z-10 flex flex-1 items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-black/90 text-white">
          <span className="text-xl font-bold leading-none">{dayOfMonth}</span>
          <span className="mt-0.5 text-[9px] font-bold text-zinc-400">{dayOfWeek}</span>
        </div>

        <div className="flex flex-col items-start gap-1">
          <h3 className="text-lg font-bold leading-tight text-white">Training day</h3>
          <div className="flex items-center gap-1.5">
            <Pill>{workout.name}</Pill>
            {queueLabel && <Pill>{queueLabel}</Pill>}
          </div>
        </div>
      </div>

      <button
        onClick={onTrain}
        className="relative z-10 flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-zinc-100"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black">
          <ArrowRight className="h-2.5 w-2.5 stroke-[3] text-white" />
        </span>
        Train
      </button>
    </div>
  );
};
