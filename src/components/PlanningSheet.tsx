// import { useState } from 'react'; // Unused
import { BottomSheet } from './BottomSheet';
import { Toggle } from './Toggle';
import { cn } from '../lib/utils';
import { Button } from './Button';

import { useThemeStore } from '../store/themeStore';

interface PlanningSheetProps {
    isOpen: boolean;
    onClose: () => void;
    isPlanned: boolean;
    setIsPlanned: (val: boolean) => void;
    planningType: 'week_days' | 'spacing';
    setPlanningType: (val: 'week_days' | 'spacing') => void;
    selectedDays: string[];
    setSelectedDays: (days: string[]) => void;
    spacingDays: number;
    setSpacingDays: (days: number) => void;
}

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
    setSpacingDays
}: PlanningSheetProps) => {
    const { appColor } = useThemeStore();
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const toggleDay = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="Planning">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Plan workout</span>
                    <Toggle checked={isPlanned} onCheckedChange={setIsPlanned} />
                </div>

                {isPlanned && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                        <div className="bg-zinc-800 rounded-xl p-1 flex">
                            <button
                                onClick={() => setPlanningType('week_days')}
                                className={cn("flex-1 py-3 text-sm font-bold rounded-lg transition-all", planningType === 'week_days' ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-500")}
                            >
                                Week days
                            </button>
                            <button
                                onClick={() => setPlanningType('spacing')}
                                className={cn("flex-1 py-3 text-sm font-bold rounded-lg transition-all", planningType === 'spacing' ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-500")}
                            >
                                Spacing
                            </button>
                        </div>

                        {planningType === 'week_days' ? (
                            <div>
                                <p className="text-zinc-500 mb-4 text-sm font-semibold">Training days</p>
                                <div className="grid grid-cols-3 gap-3">
                                    {weekDays.map(day => (
                                        <button
                                            key={day}
                                            onClick={() => toggleDay(day)}
                                            className={cn(
                                                "py-3 rounded-xl text-xs font-bold transition-all border border-transparent",
                                                selectedDays.includes(day)
                                                    ? "text-black"
                                                    : "bg-surfaceHighlight text-white hover:bg-zinc-700"
                                            )}
                                            style={{
                                                backgroundColor: selectedDays.includes(day) ? appColor : undefined,
                                                borderColor: selectedDays.includes(day) ? appColor : undefined
                                            }}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-zinc-500 mb-4 text-sm font-semibold">Days between two workouts</p>
                                <div className="flex justify-center items-center gap-8 py-6">
                                    <button
                                        onClick={() => setSpacingDays(Math.max(0, spacingDays - 1))}
                                        className="w-12 h-12 rounded-full bg-zinc-800 text-white font-bold text-2xl flex items-center justify-center hover:bg-zinc-700 active:scale-95 transition-all"
                                    >
                                        -
                                    </button>
                                    <span className="text-5xl font-bold text-white">{spacingDays} days</span>
                                    <button
                                        onClick={() => setSpacingDays(spacingDays + 1)}
                                        className="w-12 h-12 rounded-full bg-zinc-800 text-white font-bold text-2xl flex items-center justify-center hover:bg-zinc-700 active:scale-95 transition-all"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        <Button variant="primary" fullWidth onClick={onClose} className="mt-8 bg-white text-black hover:bg-gray-200">
                            Save
                        </Button>
                    </div>
                )}
            </div>
        </BottomSheet>
    );
};
