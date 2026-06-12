import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useEquipmentStore } from '../../store/equipmentStore';
import { EQUIPMENT_OPTIONS } from '../../constants';

interface EquipmentSelectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEquipment: string[];
  onToggle: (equipmentName: string) => void;
}

/** Per-exercise equipment picker, limited to what the user owns (see Settings). */
export const EquipmentSelectSheet = ({
  isOpen,
  onClose,
  selectedEquipment,
  onToggle,
}: EquipmentSelectSheetProps) => {
  const ownedIds = useEquipmentStore((state) => state.selectedEquipment);
  const availableOptions = EQUIPMENT_OPTIONS.filter((option) => ownedIds.includes(option.id));

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Select Equipment" zIndex={110}>
      {availableOptions.length === 0 ? (
        <div className="mb-4 flex flex-col items-center rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center">
          <p className="mb-1 text-sm font-bold text-red-400">No equipment enabled.</p>
          <p className="text-xs text-red-400/70">
            Go to Settings &gt; Your equipment to select what you have available.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {availableOptions.map((option) => {
            const isSelected = selectedEquipment.includes(option.name);
            return (
              <button
                key={option.id}
                onClick={() => onToggle(option.name)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all',
                  isSelected ? 'border-accent bg-accent-soft' : 'border-zinc-800 bg-zinc-800/50',
                )}
              >
                <span
                  className={cn('text-sm font-bold', isSelected ? 'text-white' : 'text-zinc-300')}
                >
                  {option.name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="pt-4">
        <Button variant="primary" fullWidth onClick={onClose} className="bg-accent text-white">
          Done
        </Button>
      </div>
    </BottomSheet>
  );
};
