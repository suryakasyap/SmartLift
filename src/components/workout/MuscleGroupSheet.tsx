import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { MUSCLE_GROUPS } from '../../constants';

interface MuscleGroupSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroups: string[];
  onToggle: (group: string) => void;
}

/** Multi-select for the muscle groups an exercise targets. */
export const MuscleGroupSheet = ({
  isOpen,
  onClose,
  selectedGroups,
  onToggle,
}: MuscleGroupSheetProps) => (
  <BottomSheet isOpen={isOpen} onClose={onClose} title="Select Muscle Group" zIndex={110}>
    <div className="space-y-6">
      {MUSCLE_GROUPS.map((section) => (
        <div key={section.category}>
          <h3 className="mb-3 ml-1 text-xs font-bold uppercase tracking-wider text-zinc-500">
            {section.category}
          </h3>
          <div className="space-y-2">
            {section.items.map((item) => {
              const isSelected = selectedGroups.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => onToggle(item)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all',
                    isSelected
                      ? 'border-accent bg-accent-soft'
                      : 'border-zinc-800 bg-zinc-800/50',
                  )}
                >
                  <span
                    className={cn('text-sm font-bold', isSelected ? 'text-white' : 'text-zinc-300')}
                  >
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>

    <div className="pt-4">
      <Button variant="primary" fullWidth onClick={onClose} className="bg-accent text-white">
        Done
      </Button>
    </div>
  </BottomSheet>
);
