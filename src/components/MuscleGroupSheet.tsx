import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { useThemeStore } from '../store/themeStore';
import { cn } from '../lib/utils';

interface MuscleGroupSheetProps {
    isOpen: boolean;
    onClose: () => void;
    selectedGroups: string[];
    onToggle: (group: string) => void;
}

const MUSCLE_GROUPS = [
    {
        category: 'Upper Body',
        items: ['Chest', 'Back', 'Shoulders', 'Arms', 'Forearms']
    },
    {
        category: 'Lower Body',
        items: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves']
    },
    {
        category: 'Core',
        items: ['Abs', 'Obliques', 'Lower Back']
    }
];

export const MuscleGroupSheet = ({ isOpen, onClose, selectedGroups, onToggle }: MuscleGroupSheetProps) => {
    const { appColor } = useThemeStore();

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="Select Muscle Group" zIndex={110}>
            <div className="space-y-6">
                {MUSCLE_GROUPS.map((section) => (
                    <div key={section.category}>
                        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3 ml-1">
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
                                            "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                                            isSelected ? "border-transparent" : "border-zinc-800 bg-zinc-800/50"
                                        )}
                                        style={{
                                            borderColor: isSelected ? appColor : undefined,
                                            backgroundColor: isSelected ? `${appColor}33` : undefined // ~20% opacity (hex 33)
                                        }}
                                    >
                                        <span className={cn(
                                            "font-bold text-sm",
                                            isSelected ? "text-white" : "text-zinc-300"
                                        )}>
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
