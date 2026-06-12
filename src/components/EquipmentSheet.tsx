import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { useEquipmentStore, EQUIPMENT_OPTIONS } from '../store/equipmentStore';
import { useThemeStore } from '../store/themeStore';

interface EquipmentSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EquipmentSheet = ({ isOpen, onClose }: EquipmentSheetProps) => {
    const { selectedEquipment, toggleEquipment } = useEquipmentStore();
    const { appColor } = useThemeStore();

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="Your equipment">
            <div className="space-y-3">
                {EQUIPMENT_OPTIONS.map((equipment) => {
                    const isSelected = selectedEquipment.includes(equipment.id);
                    return (
                        <button
                            key={equipment.id}
                            onClick={() => toggleEquipment(equipment.id)}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all bg-zinc-900"
                            style={{
                                borderColor: isSelected ? appColor : '#27272a',
                            }}
                        >
                            <span className="font-bold text-lg flex-1 text-left text-white">
                                {equipment.name}
                            </span>
                        </button>
                    );
                })}
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
