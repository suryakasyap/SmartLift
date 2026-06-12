import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useEquipmentStore } from '../../store/equipmentStore';
import { EQUIPMENT_OPTIONS } from '../../constants';

interface EquipmentSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Settings sheet where the user declares which equipment they own. */
export const EquipmentSheet = ({ isOpen, onClose }: EquipmentSheetProps) => {
  const { selectedEquipment, toggleEquipment } = useEquipmentStore();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Your equipment">
      <div className="space-y-3">
        {EQUIPMENT_OPTIONS.map((equipment) => (
          <button
            key={equipment.id}
            onClick={() => toggleEquipment(equipment.id)}
            className={cn(
              'flex w-full items-center gap-4 rounded-2xl border-2 bg-zinc-900 p-4 transition-all',
              selectedEquipment.includes(equipment.id) ? 'border-accent' : 'border-zinc-800',
            )}
          >
            <span className="flex-1 text-left text-lg font-bold text-white">{equipment.name}</span>
          </button>
        ))}
      </div>

      <Button
        variant="primary"
        fullWidth
        onClick={onClose}
        className="mt-8 bg-white text-black hover:bg-gray-200"
      >
        Save
      </Button>
    </BottomSheet>
  );
};
