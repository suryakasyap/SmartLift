import { BottomSheet } from '../ui/BottomSheet';
import { Toggle } from '../ui/Toggle';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { WEEK_DAYS } from '../../constants';
import type { PlanningType } from '../../db/db';

type SchedulingMode = Exclude<PlanningType, 'never'>;

interface PlanningSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isPlanned: boolean;
  setIsPlanned: (value: boolean) => void;
  planningType: SchedulingMode;
  setPlanningType: (value: SchedulingMode) => void;
  selectedDays: string[];
  setSelectedDays: (days: string[]) => void;
  spacingDays: number;
  setSpacingDays: (days: number) => void;
}

/** Schedule editor: pick fixed week days or an every-N-days spacing. */
export const PlanningSheet = ({
  isOpen,
  onClose,
  isPlanned,
  setIsPlanned,
  planningType,
  setPlanningType,
  selectedDays,
  setSelectedDays,
  spacingDays,
  setSpacingDays,
}: PlanningSheetProps) => {
  const toggleDay = (day: string) => {
    setSelectedDays(
      selectedDays.includes(day)
        ? selectedDays.filter((selected) => selected !== day)
        : [...selectedDays, day],
    );
  };

  const modeButton = (mode: SchedulingMode, label: string) => (
    <button
      onClick={() => setPlanningType(mode)}
      className={cn(
        'flex-1 rounded-lg py-3 text-sm font-bold transition-all',
        planningType === mode ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500',
      )}
    >
      {label}
    </button>
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Planning">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white">Plan workout</span>
          <Toggle checked={isPlanned} onCheckedChange={setIsPlanned} />
        </div>

        {isPlanned && (
          <div className="space-y-6">
            <div className="flex rounded-xl bg-zinc-800 p-1">
              {modeButton('week_days', 'Week days')}
              {modeButton('spacing', 'Spacing')}
            </div>

            {planningType === 'week_days' ? (
              <div>
                <p className="mb-4 text-sm font-semibold text-zinc-500">Training days</p>
                <div className="grid grid-cols-3 gap-3">
                  {WEEK_DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={cn(
                        'rounded-xl border border-transparent py-3 text-xs font-bold transition-all',
                        selectedDays.includes(day)
                          ? 'border-accent bg-accent text-black'
                          : 'bg-surface-raised text-white hover:bg-zinc-700',
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-4 text-sm font-semibold text-zinc-500">
                  Days between two workouts
                </p>
                <div className="flex items-center justify-center gap-8 py-6">
                  <button
                    onClick={() => setSpacingDays(Math.max(0, spacingDays - 1))}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-2xl font-bold text-white transition-all hover:bg-zinc-700 active:scale-95"
                  >
                    -
                  </button>
                  <span className="text-5xl font-bold text-white">{spacingDays} days</span>
                  <button
                    onClick={() => setSpacingDays(spacingDays + 1)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-2xl font-bold text-white transition-all hover:bg-zinc-700 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <Button
              variant="primary"
              fullWidth
              onClick={onClose}
              className="mt-8 bg-white text-black hover:bg-gray-200"
            >
              Save
            </Button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
