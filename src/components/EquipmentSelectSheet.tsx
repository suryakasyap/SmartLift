import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { useThemeStore } from '../store/themeStore';
import { useEquipmentStore, EQUIPMENT_OPTIONS } from '../store/equipmentStore';
import { cn } from '../lib/utils';

interface EquipmentSelectSheetProps {
    isOpen: boolean;
    onClose: () => void;
    selectedEquipment: string[];
    onToggle: (equipment: string) => void;
}

export const EquipmentSelectSheet = ({ isOpen, onClose, selectedEquipment, onToggle }: EquipmentSelectSheetProps) => {
    const { appColor } = useThemeStore();
    const { selectedEquipment: availableEquipmentIds } = useEquipmentStore();

    // Filter options based on what the user has enabled in Settings
    const availableOptions = EQUIPMENT_OPTIONS.filter(opt =>
        availableEquipmentIds.includes(opt.id)
    );

    const displayOptions = availableOptions;

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="Select Equipment" zIndex={110}>
            {displayOptions.length === 0 ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 flex flex-col items-center text-center">
                    <p className="text-red-400 font-bold text-sm mb-1">No equipment enabled.</p>
                    <p className="text-red-400/70 font-normal text-xs">
                        Go to Settings {'>'} Your equipment to select what you have available.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {displayOptions.map((item) => {
                        const isSelected = selectedEquipment.includes(item.name);
                        return (
                            <button
                                key={item.id}
                                onClick={() => onToggle(item.name)}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                                    isSelected ? "border-transparent" : "border-zinc-800 bg-zinc-800/50"
                                )}
                                style={{
                                    borderColor: isSelected ? appColor : undefined,
                                    backgroundColor: isSelected ? `${appColor}33` : undefined // ~20% opacity
                                }}
                            >
                                <span className={cn(
                                    "font-bold text-sm",
                                    isSelected ? "text-white" : "text-zinc-300"
                                )}>
                                    {item.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="pt-4">
                <Button
                    variant="primary"
                    fullWidth
                    onClick={onClose}
                    style={{ backgroundColor: appColor, color: 'white' }}
                >
                    Done
                </Button>
            </div>
        </BottomSheet>
    );
};
