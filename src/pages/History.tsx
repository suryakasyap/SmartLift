import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type WorkoutLog } from '../db/db';
import { RefreshCcw, Dumbbell, Flame, Calendar as CalendarIcon, LayoutGrid, List, Pencil, Trash2 } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useUserStore } from '../store/userStore';

const HistoryCard = ({ log, isGridView }: { log: WorkoutLog; isGridView: boolean }) => {
    const { appColor } = useThemeStore();
    const { units } = useUserStore();
    const navigate = useNavigate();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Fetch the workout and its exercises to get specific colors
    const workout = useLiveQuery(() => db.workouts.get(log.workoutId));
    const workoutExercises = useLiveQuery(() => db.exercises.where('workoutId').equals(log.workoutId).toArray());

    const dateStr = new Date(log.date).toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });

    // If no specific exercise data, fallback to generic
    if (!log.exercises || log.exercises.length === 0) {
        const accentColor = workout?.color || appColor;
        return (
            <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl text-white tracking-tight" style={{ color: accentColor }}>{log.workoutName || "Workout"}</h3>
                    <span className="text-zinc-500 font-bold text-xs bg-zinc-800 px-2 py-1 rounded-md">{dateStr}</span>
                </div>
                <div className="text-zinc-400 font-medium text-sm">
                    {Math.floor(log.durationSeconds / 60)} min session
                </div>
            </div>
        );
    }

    // Helper for weight conversion
    const convertWeight = (weight: number, fromUnit: 'Metrics' | 'Imperial' | undefined, toUnit: 'Metrics' | 'Imperial') => {
        // Default to 'Metrics' if fromUnit is missing (for legacy logs)
        const sourceUnit = fromUnit || 'Metrics';

        if (sourceUnit === toUnit) return weight;
        if (sourceUnit === 'Metrics' && toUnit === 'Imperial') return weight * 2.20462;
        if (sourceUnit === 'Imperial' && toUnit === 'Metrics') return weight / 2.20462;
        return weight;
    };

    return (
        <div className={`flex flex-col ${isGridView ? 'space-y-1' : 'space-y-4'}`}>
            {/* Header with Date for the session context */}
            <div className={`flex items-center gap-2 px-2 ${isGridView ? 'mb-0' : 'mb-2'}`}>
                <CalendarIcon className={`text-zinc-500 flex-shrink-0 ${isGridView ? 'w-3 h-3' : 'w-4 h-4'}`} />
                <div className={`flex items-center overflow-hidden flex-1 ${isGridView ? 'gap-1 text-[10px]' : 'gap-2 text-sm'}`}>
                    <span className="text-zinc-400 font-bold whitespace-nowrap">{dateStr}</span>
                    <span className="text-zinc-600 text-xs flex-shrink-0">•</span>
                    <span className="text-zinc-400 font-bold truncate min-w-0" title={log.workoutName}>
                        {log.workoutName}
                    </span>
                </div>
                {/* Edit & Delete */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={() => {
                            if (log.exercises && log.exercises.length > 0) {
                                const ex = log.exercises[0];
                                navigate(`/workout/${log.workoutId}`, {
                                    state: {
                                        editLogId: log.id,
                                        prefillSets: ex.sets,
                                        exerciseName: ex.name
                                    }
                                });
                            }
                        }}
                        className={`group rounded-full flex items-center justify-center transition-colors hover:bg-zinc-800 ${isGridView ? 'w-5 h-5' : 'w-7 h-7'}`}
                        title="Edit log"
                    >
                        <Pencil className={`transition-colors text-zinc-500 group-hover:text-white ${isGridView ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`} />
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className={`group rounded-full flex items-center justify-center transition-colors hover:bg-zinc-800 ${isGridView ? 'w-5 h-5' : 'w-7 h-7'}`}
                        title="Delete log"
                    >
                        <Trash2 className={`transition-colors text-zinc-500 group-hover:text-red-400 ${isGridView ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`} />
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Overlay */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div
                        className="relative bg-zinc-900 rounded-2xl border border-zinc-700 p-6 w-full max-w-xs animate-in fade-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <p className="font-bold text-sm mb-1">Delete this log?</p>
                        <p className="text-zinc-400 text-xs mb-4">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl transition-colors text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    await db.workoutLogs.delete(log.id);
                                    setShowDeleteConfirm(false);
                                }}
                                className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold py-2.5 rounded-xl transition-colors text-xs"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`grid gap-4 grid-cols-1`}>
                {log.exercises.map((ex, i) => {
                    const reps = ex.sets.map(s => s.reps).join('-');
                    /* WARNING: Displaying raw weights in the list (weights string) might be confusing if not converted too. 
                       But converting a join string "100-110-120" is hard efficiently in one line. 
                       For now, let's keep the list raw or try to map it?
                       User asked for "sync the weight conversion". 
                       If I see "100-110" (lbs) but I am in Kg, it should probably be "45-50".
                       Let's parse and convert the display string too.
                    */
                    const weights = ex.sets.map(s => {
                        const val = parseFloat(s.weight) || 0;
                        const converted = convertWeight(val, log.unit, units);
                        return Math.round(converted);
                    }).join('-');

                    const maxReps = Math.max(...ex.sets.map(s => parseInt(s.reps) || 0));
                    const rawMaxWeight = Math.max(...ex.sets.map(s => parseFloat(s.weight) || 0));
                    const maxWeight = Math.round(convertWeight(rawMaxWeight, log.unit, units));

                    // Find the exercise definition to get its specific color
                    const exerciseDef = workoutExercises?.find(e => e.name === ex.name);
                    // Fallback priority: Exercise Color > Workout Color > App Global Color
                    const accentColor = exerciseDef?.color || workout?.color || appColor;

                    return (
                        <div
                            key={i}
                            className={`bg-zinc-900 border border-zinc-800 relative overflow-hidden flex flex-col justify-between
                                ${isGridView ? 'rounded-[24px] p-4 aspect-square' : 'rounded-[32px] p-6'}
                            `}
                        >
                            {/* Title */}
                            <h3
                                className={`font-bold transition-all ${isGridView ? 'text-lg leading-tight mb-2' : 'text-2xl mb-6'}`}
                                style={{ color: accentColor }}
                            >
                                {ex.name}
                            </h3>

                            {!isGridView && <p className="text-zinc-500 text-sm font-bold mb-4">Session Stats</p>}

                            <div className={`space-y-${isGridView ? '2' : '6'}`}>
                                {/* Reps Row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-zinc-400">
                                        <RefreshCcw className="w-4 h-4" />
                                        <span className={`font-mono tracking-wider text-zinc-300 ${isGridView ? 'text-sm' : 'text-lg'}`}>{reps || "0"}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`block font-bold text-white leading-none ${isGridView ? 'text-lg' : 'text-2xl'}`}>{maxReps}</span>
                                        <span
                                            className="text-[8px] font-bold uppercase tracking-widest block mt-0.5"
                                            style={{ color: accentColor }}
                                        >
                                            Max Reps
                                        </span>
                                    </div>
                                </div>

                                {/* Weight Row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-zinc-400">
                                        <Dumbbell className="w-4 h-4" />
                                        <span className={`font-mono tracking-wider text-zinc-300 ${isGridView ? 'text-sm' : 'text-lg'}`}>{weights || "0"}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`block font-bold text-white leading-none ${isGridView ? 'text-lg' : 'text-2xl'}`}>{maxWeight}</span>
                                        <span
                                            className="text-[8px] font-bold uppercase tracking-widest block mt-0.5"
                                            style={{ color: accentColor }}
                                        >
                                            Max {units === 'Imperial' ? 'Lbs' : 'Kg'}
                                        </span>
                                    </div>
                                </div>

                                {/* Volume / Streak Row (Bottom) */}
                                <div className={`flex items-center gap-2 ${isGridView ? 'pt-1' : 'pt-2'}`}>
                                    <span className={`font-bold text-white ${isGridView ? 'text-xl' : 'text-3xl'}`}>{ex.sets.length}</span>
                                    <Flame className={`${isGridView ? 'w-4 h-4' : 'w-6 h-6'}`} style={{ color: accentColor, fill: accentColor }} />
                                    <span className="text-zinc-600 text-xs font-bold uppercase ml-1">Sets</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default function HistoryPage() {
    const history = useLiveQuery(() => db.workoutLogs.orderBy('date').reverse().toArray());
    const [isGridView, setIsGridView] = useState(() => {
        const saved = localStorage.getItem('historyViewMode');
        return saved ? saved === 'grid' : true; // default to grid
    });

    const toggleView = () => {
        setIsGridView(prev => {
            const next = !prev;
            localStorage.setItem('historyViewMode', next ? 'grid' : 'list');
            return next;
        });
    };

    return (
        <div className="p-4 pt-12 min-h-screen pb-24 bg-black text-white">
            <div className="flex items-center justify-between mb-8 px-2">
                <h1 className="text-3xl font-bold">History</h1>
                <button
                    onClick={toggleView}
                    className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors border border-zinc-800"
                >
                    {isGridView ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
                </button>
            </div>

            <div className={isGridView ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-8'}>
                {history?.map((log) => (
                    <HistoryCard key={log.id} log={log} isGridView={isGridView} />
                ))}

                {(!history || history.length === 0) && (
                    <div className={`text-center text-zinc-500 py-20 flex flex-col items-center ${isGridView ? 'col-span-2' : ''}`}>
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-600">
                            <CalendarIcon className="w-8 h-8" />
                        </div>
                        <p className="font-bold text-zinc-400">No history yet</p>
                        <p className="text-xs mt-1">Complete a workout to see it here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
