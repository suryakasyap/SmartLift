import { Button } from './Button';
import { Toggle } from './Toggle';
import { PlanningSheet } from './PlanningSheet';
import { ReminderSheet } from './ReminderSheet';
import { BottomSheet } from './BottomSheet';
import { Calendar, Clock, Repeat, Dumbbell, Pencil, Trash2 } from 'lucide-react';
import { db, type Exercise } from '../db/db';
import { useWorkoutStore } from '../store/workoutStore';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

interface CreateWorkoutSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onExerciseAdd?: () => void; // Callback to open exercise sheet for adding
    onExerciseEdit?: (exercise: Exercise) => void; // Callback to open exercise sheet for editing
}

export const CreateWorkoutSheet = ({ isOpen, onClose, onExerciseAdd, onExerciseEdit }: CreateWorkoutSheetProps) => {
    const {
        name, setName,
        isPlanned, setIsPlanned,
        planningType, setPlanningType,
        selectedDays, setSelectedDays,
        spacingDays, setSpacingDays,
        reminderEnabled, setReminderEnabled,
        reminderTime, setReminderTime,
        timeFormat, setTimeFormat,
        cycleEnabled, setCycleEnabled,
        cycleCount, setCycleCount,
        exercises,
        removeExercise,
        reset,
        color, setColor,
        targetSets,
        repType,
        restTime
    } = useWorkoutStore();

    const { appColor } = useThemeStore();

    useEffect(() => {
        if (isOpen) {
            setColor(appColor);
        }
    }, [isOpen, appColor, setColor]);

    const [isPlanningOpen, setIsPlanningOpen] = useState(false);
    const [isReminderOpen, setIsReminderOpen] = useState(false);


    const handleReminderToggle = (enabled: boolean) => {
        setReminderEnabled(enabled);
        if (enabled && reminderTime === '18:30') {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            setReminderTime(`${h}:${m}`);
        }
    };

    const handleCreate = async () => {
        if (!name) return;

        const workoutId = await db.workouts.add({
            name,
            planning_type: isPlanned ? planningType : 'never',
            week_days: selectedDays,
            spacing_days: spacingDays,
            first_workout_date: planningType === 'spacing' ? new Date() : undefined,
            reminder_time: reminderEnabled ? reminderTime : undefined,
            cycle_enabled: cycleEnabled,
            cycle_count: cycleEnabled ? cycleCount : undefined,
            rest_time: restTime,
            color,
            target_sets: targetSets,
            rep_type: repType
        });

        if (exercises.length > 0) {
            await db.exercises.bulkAdd(exercises.map(e => ({
                ...e,
                workoutId
            })));
        }

        reset();
        onClose();
    };

    const formatTimeDisplay = (time24: string, format: '12h' | '24h') => {
        if (!time24) return '--:--';
        if (format === '24h') return time24;

        const parts = time24.split(':');
        if (parts.length < 2) return time24;

        const [h, m] = parts.map(Number);
        if (isNaN(h) || isNaN(m)) return time24;

        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    const renderPlanningDots = () => {
        if (!isPlanned) return null;
        if (planningType === 'spacing') return <span className="text-sm font-mono text-zinc-400">Every {spacingDays} days</span>;

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const shortDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

        return (
            <div className="flex gap-1">
                {days.map((d, i) => {
                    const isSelected = selectedDays.includes(d);
                    return (
                        <div key={i} className="flex flex-col items-center gap-0.5">
                            <span className="text-[9px] font-bold text-zinc-600">{shortDays[i]}</span>
                            <div
                                className={`w-1.5 h-1.5 rounded-full ${!isSelected ? 'bg-zinc-800' : ''}`}
                                style={{ backgroundColor: isSelected ? color : undefined }}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <BottomSheet isOpen={isOpen} onClose={onClose} title="New workout">
                {/* Name Input */}
                <input
                    type="text"
                    placeholder="Workout name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-transparent text-3xl font-bold placeholder:text-zinc-700 outline-none mb-6 caret-white text-white"
                />

                {/* Form Sections */}
                <div className="space-y-0 divide-y divide-zinc-800">

                    {/* Planning Row */}
                    <div onClick={() => setIsPlanningOpen(true)} className="flex items-center justify-between py-4 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <Calendar className="text-zinc-500 w-5 h-5" />
                            <span className="font-bold text-white">Planning</span>
                        </div>
                        <div>
                            {isPlanned ? renderPlanningDots() : <span className="text-zinc-600 font-medium text-sm">None</span>}
                        </div>
                    </div>

                    {/* Reminders Row */}
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <Clock className="text-zinc-500 w-5 h-5" />
                            <span className="font-bold text-white">Reminders</span>
                        </div>
                        <Toggle checked={reminderEnabled} onCheckedChange={handleReminderToggle} activeColor={color} />
                    </div>

                    {reminderEnabled && (
                        <div onClick={() => setIsReminderOpen(true)} className="flex items-center justify-between py-4 pl-8 cursor-pointer">
                            <span className="text-zinc-500 font-medium">Time</span>
                            <div className="bg-zinc-800 px-3 py-1.5 rounded-lg text-sm font-bold text-white">
                                {formatTimeDisplay(reminderTime, timeFormat)}
                            </div>
                        </div>
                    )}

                    {/* Exercises Row */}
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <Dumbbell className="text-zinc-500 w-5 h-5" />
                            <span className="font-bold text-white">Exercises</span>
                        </div>
                        <Button
                            variant="secondary"
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-full transition-colors"
                            onClick={onExerciseAdd}
                        >
                            + add exercise
                        </Button>
                    </div>

                    {/* Render added exercises */}
                    {exercises.length > 0 && (
                        <div className="py-4 space-y-2">
                            {exercises.map((ex, i) => (
                                <div key={i} className="bg-zinc-800/50 rounded-xl p-3 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-white text-sm" style={{ color: ex.color || 'white' }}>{ex.name}</h3>
                                        <p className="text-zinc-500 text-xs">{ex.rep_type === 'time' ? 'Time based' : `${ex.target_reps} reps`} • {ex.target_weight}kg</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => onExerciseEdit?.(ex)}
                                            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                                            title="Edit exercise"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeExercise(ex.id)}
                                            className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                                            title="Delete exercise"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Cycle Row */}
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <Repeat className="text-zinc-500 w-5 h-5" />
                            <span className="font-bold text-white">Cycle this workout</span>
                        </div>

                        <div className="flex items-center gap-4">
                            {cycleEnabled && (
                                <div className="flex items-center bg-zinc-800 rounded-lg p-1">
                                    <button
                                        onClick={() => setCycleCount(Math.max(1, cycleCount - 1))}
                                        className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="font-mono font-bold w-6 text-center text-sm text-white">{cycleCount}</span>
                                    <button
                                        onClick={() => setCycleCount(cycleCount + 1)}
                                        className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            )}
                            <Toggle checked={cycleEnabled} onCheckedChange={setCycleEnabled} activeColor={color} />
                        </div>
                    </div>
                </div>

                {/* Create Button */}
                <Button
                    fullWidth
                    className="mt-8 text-white shadow-lg font-bold py-4 rounded-2xl transition-all"
                    style={{
                        backgroundColor: name ? color : appColor,
                        opacity: name ? 1 : 0.5
                    }}
                    onClick={handleCreate}
                    disabled={!name}
                >
                    Create workout
                </Button>
            </BottomSheet>

            {/* Nested Sheets */}
            <PlanningSheet
                isOpen={isPlanningOpen}
                onClose={() => setIsPlanningOpen(false)}
                isPlanned={isPlanned}
                setIsPlanned={setIsPlanned}
                planningType={planningType}
                setPlanningType={setPlanningType}
                selectedDays={selectedDays}
                setSelectedDays={setSelectedDays}
                spacingDays={spacingDays}
                setSpacingDays={setSpacingDays}
            />

            <ReminderSheet
                isOpen={isReminderOpen}
                onClose={() => setIsReminderOpen(false)}
                currentTime={reminderTime}
                onSave={setReminderTime}
                currentFormat={timeFormat}
                onFormatChange={setTimeFormat}
            />
        </>
    );
};
