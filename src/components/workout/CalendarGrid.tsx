import { useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Workout, WorkoutLog } from '../../db/db';
import { useDevStore } from '../../store/devStore';
import { useUserStore } from '../../store/userStore';
import { isWorkoutScheduled } from '../../lib/scheduler';
import { isSameDay } from '../../lib/datetime';
import { MONTH_NAMES } from '../../constants';

const MONDAY_FIRST_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const SUNDAY_FIRST_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface CalendarGridProps {
  workouts?: Workout[];
  logs?: WorkoutLog[];
}

interface CalendarDay {
  date: Date;
  isToday: boolean;
  planned: boolean;
  completed: boolean;
}

const dayAppearance = (day: CalendarDay): { className: string; icon: ReactNode } => {
  if (day.completed) {
    return {
      className: 'bg-[#fabc7a] text-black',
      icon: <Check className="h-3.5 w-3.5 stroke-[4]" />,
    };
  }
  if (day.planned) {
    return {
      className: day.isToday ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500',
      icon: <Dumbbell className="h-3.5 w-3.5 fill-current" />,
    };
  }
  return {
    className: day.isToday ? 'border border-zinc-700 bg-zinc-800' : 'bg-zinc-900',
    icon: null,
  };
};

/** Month view marking planned and completed training days. */
export const CalendarGrid = ({ workouts = [], logs = [] }: CalendarGridProps) => {
  const { systemDate } = useDevStore();
  const { weekStart } = useUserStore();
  // Tracks the month currently being viewed; today always follows systemDate.
  const [viewDate, setViewDate] = useState(() => new Date(systemDate));

  const today = new Date(systemDate);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // How many leading blanks before day 1, given the configured week start.
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday
  const offset = weekStart === 'Monday' ? (firstWeekday + 6) % 7 : firstWeekday;

  const days: (CalendarDay | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return {
        date,
        isToday: isSameDay(date, today),
        planned: workouts.some((workout) => isWorkoutScheduled(workout, date)),
        completed: logs.some((log) => isSameDay(new Date(log.date), date)),
      };
    }),
  ];

  const weekDayLabels = weekStart === 'Monday' ? MONDAY_FIRST_LABELS : SUNDAY_FIRST_LABELS;

  return (
    <div className="w-full select-none">
      <div className="mb-4 flex items-center justify-between px-2">
        <span className="text-lg font-bold">
          {MONTH_NAMES[month]} {year}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            aria-label="Previous month"
            className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            aria-label="Next month"
            className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1.5">
        {weekDayLabels.map((label, index) => (
          <div key={index} className="text-center text-[10px] font-bold text-zinc-500">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, index) => {
          if (!day) return <div key={index} className="aspect-[4/3]" />;

          const { className, icon } = dayAppearance(day);
          return (
            <div
              key={index}
              className={cn(
                'flex aspect-[4/3] items-center justify-center rounded-md transition-all',
                className,
              )}
            >
              {icon}
            </div>
          );
        })}
      </div>
    </div>
  );
};
