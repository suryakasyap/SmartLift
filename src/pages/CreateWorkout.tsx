import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { Toggle } from '../components/Toggle';
import { PlanningSheet } from '../components/PlanningSheet';
import { ReminderSheet } from '../components/ReminderSheet';
import { Calendar, Clock, Repeat, Dumbbell, Trash2, Pencil, ChevronLeft } from 'lucide-react';
import { db, type Workout } from '../db/db';
import { useWorkoutStore } from '../store/workoutStore';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

export default function CreateWorkout() {
    const navigate = useNavigate();
    const location = useLocation();
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
        addExercise,
        removeExercise,
        reset,
        // Customization
        color, setColor,
        targetSets,
        repType,
        restTime,
        editingId, setEditingId
    } = useWorkoutStore();

    // Auto-set color from theme on mount IF NOT EDITING
    const { appColor } = useThemeStore();

    useEffect(() => {
        if (!editingId && !location.state?.workout) {
            setColor(appColor);
        }
    }, [appColor, setColor, editingId, location.state]);

    // Hydration Logic
    useEffect(() => {
        if (location.state?.workout) {
            const w = location.state.workout;
            // If we are already editing this workout (e.g. returning from adding exercise), don't reload
            if (useWorkoutStore.getState().editingId === w.id) return;

            setEditingId(w.id);
            setName(w.name);
            setIsPlanned(w.planning_type !== 'never');
            setPlanningType((w.planning_type === 'never' ? 'week_days' : w.planning_type) || 'week_days');
            setSelectedDays(w.week_days || []);
            setSpacingDays(w.spacing_days || 0);
            setReminderEnabled(!!w.reminder_time);
            setReminderTime(w.reminder_time || '18:30');
            setCycleEnabled(w.cycle_enabled);
            setCycleCount(w.cycle_count || 3);
            setColor(w.color || appColor);

            // Load exercises
            db.exercises.where('workoutId').equals(w.id).toArray().then(exs => {
                useWorkoutStore.setState({ exercises: [] });
                exs.forEach(addExercise);
            });
        }
    }, [location.state, setEditingId, setName, setIsPlanned, setPlanningType, setSelectedDays, setSpacingDays, setReminderEnabled, setReminderTime, setCycleEnabled, setCycleCount, setColor, appColor, addExercise]);

    const [isPlanningOpen, setIsPlanningOpen] = useState(false);
    const [isReminderOpen, setIsReminderOpen] = useState(false);

    // Handler for reminder toggle
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

        const workoutData: Omit<Workout, 'id'> = {
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
        };

        let workoutId = editingId;

        if (editingId) {
            // Update
            await db.workouts.update(editingId, workoutData);
            // Replace exercises (Simplest strategy: Delete all, re-add)
            await db.exercises.where('workoutId').equals(editingId).delete();
        } else {
            // Create
            workoutId = await db.workouts.add(workoutData);
        }

        if (exercises.length > 0 && workoutId) {
            await db.exercises.bulkAdd(exercises.map(e => ({
                ...e,
                id: undefined, // Create new entries
                workoutId: workoutId!
            })));
        }

        reset();
        navigate('/');
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
        <div className="min-h-screen bg-black p-6 pb-8 text-white flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => {
                        reset(); // Clear store if cancelling
                        navigate(-1)
                    }}
                    className="w-10 h-10 flex items-center justify-center -ml-2 text-zinc-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold">{editingId ? 'Edit Workout' : 'New workout'}</h1>
                <div className="w-10" />
            </div>

            <input
                type="text"
                placeholder="Workout name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-transparent text-4xl font-bold placeholder:text-zinc-800 outline-none mb-2 caret-orange-500 text-white"
            />

            {/* Form Sections */}
            <div className="space-y-0 divide-y divide-zinc-900 border-t border-b border-zinc-900 mt-8">

                {/* Planning Row */}
                <div onClick={() => setIsPlanningOpen(true)} className="flex items-center justify-between py-4 cursor-pointer group hover:bg-zinc-900/30 transition-colors -mx-2 px-2 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Calendar className="text-zinc-500 w-5 h-5" />
                        <span className="font-bold">Planning</span>
                    </div>
                    <div>
                        {isPlanned ? renderPlanningDots() : <span className="text-zinc-600 font-medium text-sm">None</span>}
                    </div>
                </div>

                {/* Reminders Row */}
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        <Clock className="text-zinc-500 w-5 h-5" />
                        <span className="font-bold">Reminders</span>
                    </div>
                    <Toggle checked={reminderEnabled} onCheckedChange={handleReminderToggle} activeColor={color} />
                </div>

                {reminderEnabled && (
                    <div onClick={() => setIsReminderOpen(true)} className="flex items-center justify-between py-4 pl-8 cursor-pointer group">
                        <span className="text-zinc-500 font-medium">Time</span>
                        <div className="bg-zinc-900 px-3 py-1.5 rounded-lg text-sm font-bold text-white">
                            {formatTimeDisplay(reminderTime, timeFormat)}
                        </div>
                    </div>
                )}

                {/* Exercises Row */}
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        <Dumbbell className="text-zinc-500 w-5 h-5" />
                        <span className="font-bold">Exercises</span>
                        {exercises.length > 0 && (
                            <span className="bg-zinc-800 text-xs px-2 py-0.5 rounded-full text-zinc-400">{exercises.length}</span>
                        )}
                    </div>
                    <Button
                        variant="secondary"
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold rounded-full transition-colors"
                        onClick={() => navigate('/create-exercise')}
                    >
                        + add exercise
                    </Button>
                </div>

                {/* Add to home / Cycle */}
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        <Repeat className="text-zinc-500 w-5 h-5" />
                        <span className="font-bold">Cycle this workout</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {cycleEnabled && (
                            <div className="flex items-center bg-zinc-900 rounded-lg p-1 animate-in fade-in slide-in-from-right-4 duration-300">
                                <button
                                    onClick={() => setCycleCount(Math.max(1, cycleCount - 1))}
                                    className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                >
                                    -
                                </button>
                                <span className="font-mono font-bold w-8 text-center text-sm">{cycleCount}</span>
                                <button
                                    onClick={() => setCycleCount(cycleCount + 1)}
                                    className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        )}
                        <Toggle checked={cycleEnabled} onCheckedChange={setCycleEnabled} activeColor={color} />
                    </div>
                </div>

            </div>

            {/* Render added exercises - Outside main form container for better visibility */}
            {exercises.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-bold text-zinc-500 mb-2">Added Exercises</h3>
                    {exercises.map((ex, i) => (
                        <div key={i} className="bg-zinc-900/50 rounded-xl p-4 flex justify-between items-center border border-zinc-800/50">
                            <div>
                                <h3 className="font-bold" style={{ color: ex.color || 'white' }}>{ex.name}</h3>
                                <p className="text-zinc-500 text-xs">{ex.rep_type === 'time' ? 'Time based' : `${ex.target_reps} reps`} • {ex.target_weight}kg</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/create-exercise', { state: { exercise: ex } })}
                                    className="w-10 h-10 bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg transition-colors flex items-center justify-center"
                                    title="Edit exercise"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => removeExercise(ex.id)}
                                    className="w-10 h-10 bg-red-900/50 text-red-400 hover:bg-red-800/50 hover:text-red-300 rounded-lg transition-colors flex items-center justify-center"
                                    title="Delete exercise"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Button
                fullWidth
                className="mt-auto w-full text-white shadow-lg font-bold py-4 rounded-2xl transition-all"
                style={{
                    backgroundColor: name ? color : (useThemeStore.getState().appColor),
                    boxShadow: name ? `0 10px 15px -3px ${color}33` : undefined
                }}
                onClick={handleCreate}
                disabled={!name}
            >
                {editingId ? 'Save Changes' : 'Create workout'}
            </Button>

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
        </div>
    );
}
