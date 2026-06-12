import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type WorkoutLog } from '../db/db';
import { Button } from '../components/Button';
import { Clock, Activity, XCircle, Trash2 } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useDevStore } from '../store/devStore';
import { TimeCounter } from '../components/Inputs';
import { useUserStore } from '../store/userStore';

interface SetData {
    id: number;
    reps: string;
    weight: string;
    isWarmup: boolean;
}

export default function WorkoutSession() {
    const { id } = useParams();
    const navigate = useNavigate();
    const workoutId = id ? parseInt(id) : 0;
    const location = useLocation();
    const exerciseId = location.state?.exerciseId;
    const editLogId = location.state?.editLogId;
    const prefillSets: { reps: string; weight: string }[] | undefined = location.state?.prefillSets;
    const editExerciseName: string | undefined = location.state?.exerciseName;

    // We need to fetch the workout to get its name for the log
    const workout = useLiveQuery(() => db.workouts.get(workoutId), [workoutId]);
    const exercises = useLiveQuery(() => db.exercises.where('workoutId').equals(workoutId).toArray(), [workoutId]);
    const { appColor } = useThemeStore();
    const { getSystemDate } = useDevStore();
    const { units } = useUserStore();

    const [sets, setSets] = useState<SetData[]>(() => {
        if (prefillSets && prefillSets.length > 0) {
            return prefillSets.map((s, i) => ({
                id: i + 1,
                reps: s.reps,
                weight: s.weight,
                isWarmup: false
            }));
        }
        return [{ id: 1, reps: '', weight: '', isWarmup: false }];
    });
    const [isWarmupEnabled, setIsWarmupEnabled] = useState(true);





    const addSet = () => {
        setSets(prev => [
            ...prev,
            { id: Date.now(), reps: '', weight: '', isWarmup: false }
        ]);
    };

    const deleteSet = (id: number) => {
        if (sets.length <= 1) return; // Keep at least one set
        setSets(prev => prev.filter(s => s.id !== id));
    };

    const handleFinish = async () => {
        if (!workout) return;

        const logData = {
            workoutId: workout.id,
            workoutName: workout.name,
            date: getSystemDate(),
            durationSeconds: 0,
            exercises: [{
                name: editExerciseName || currentExerciseName,
                sets: sets.map(s => ({ reps: s.reps, weight: s.weight }))
            }],
            unit: units
        } as WorkoutLog;

        if (editLogId) {
            await db.workoutLogs.update(editLogId, { ...logData });
        } else {
            await db.workoutLogs.add(logData);
        }

        navigate(-1);
    };

    const handleClose = () => {
        navigate(-1);
    };

    if (!workout) return <div className="p-6 text-white">Loading...</div>;

    // Find the requested exercise or default to first
    const activeExercise = exercises?.find(e => e.id === exerciseId) || exercises?.[0];
    const currentExerciseName = activeExercise?.name || "Exercise";
    const isTimeBased = activeExercise?.rep_type === 'time';

    const secondsToHMS = (s: number) => {
        const h = Math.floor(s / 3600).toString().padStart(2, '0');
        const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${h}:${m}:${sec}`;
    };
    const hmsToSeconds = (str: string) => {
        const [h, m, s] = str.split(':').map(Number);
        return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-orange-400" style={{ color: appColor }}>{currentExerciseName}</h1>
                </div>
                <div className="cursor-pointer text-zinc-400 hover:text-white transition-colors" onClick={handleClose}>
                    <XCircle className="w-8 h-8 opacity-50 hover:opacity-100 transition-opacity" />
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center mb-6 px-1">
                <button className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full text-xs font-bold border border-zinc-800 hover:bg-zinc-800 transition-colors text-white">
                    <Clock className="w-3 h-3" />
                    {workout?.rest_time ? `${Math.floor(workout.rest_time / 60)}:${(workout.rest_time % 60).toString().padStart(2, '0')}` : "3:00"} rest
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400">Warm-up</span>
                    <div
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${isWarmupEnabled ? 'bg-zinc-700' : 'bg-zinc-800'}`}
                        onClick={() => setIsWarmupEnabled(!isWarmupEnabled)}
                    >
                        <div
                            className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isWarmupEnabled ? 'left-6' : 'left-1'}`}
                            style={isWarmupEnabled ? { backgroundColor: appColor } : {}}
                        />
                    </div>
                </div>
            </div>

            {/* Sets Layout */}
            <div className={`grid ${isTimeBased ? 'grid-cols-[40px_1fr_36px]' : 'grid-cols-[40px_1fr_1fr_36px]'} gap-2 mb-3 px-1 text-[10px] font-bold text-zinc-500 text-center uppercase tracking-wider`}>
                <div>Set</div>
                {isTimeBased ? (
                    <div>Time (HH:MM:SS)</div>
                ) : (
                    <>
                        <div>Reps</div>
                        <div>Weight</div>
                    </>
                )}
                <div></div>
            </div>

            {/* Sets List */}
            <div className="flex-1 space-y-3 overflow-y-auto pb-4">
                {sets.map((set, index) => (
                    <div key={set.id} className={`grid ${isTimeBased ? 'grid-cols-[40px_1fr_36px]' : 'grid-cols-[40px_1fr_1fr_36px]'} gap-2 items-center`}>
                        <div className="flex justify-center">
                            <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-sm border border-zinc-800 text-zinc-400">
                                {isWarmupEnabled ? (
                                    index === 0 ? <Activity className="w-4 h-4" /> : index
                                ) : (
                                    index + 1
                                )}
                            </div>
                        </div>

                        {isTimeBased ? (
                            <div className="flex justify-center">
                                <TimeCounter
                                    value={hmsToSeconds(set.reps)}
                                    onChange={(val) => {
                                        const newSets = [...sets];
                                        newSets[index].reps = secondsToHMS(val);
                                        // Clear weight just in case
                                        newSets[index].weight = '';
                                        setSets(newSets);
                                    }}
                                    themeColor={appColor}
                                />
                            </div>
                        ) : (
                            <>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-center font-bold text-base focus:outline-none focus:border-white transition-colors text-white placeholder-zinc-700 w-full"
                                    value={set.reps}
                                    onChange={(e) => {
                                        const newSets = [...sets];
                                        newSets[index].reps = e.target.value;
                                        setSets(newSets);
                                    }}
                                />

                                <input
                                    type="text"
                                    placeholder="—"
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-center font-bold text-base focus:outline-none focus:border-white transition-colors text-white placeholder-zinc-700 w-full"
                                    value={set.weight}
                                    onChange={(e) => {
                                        const newSets = [...sets];
                                        newSets[index].weight = e.target.value;
                                        setSets(newSets);
                                    }}
                                />
                            </>
                        )}

                        {/* Delete Set Button */}
                        <button
                            onClick={() => deleteSet(set.id)}
                            disabled={sets.length <= 1}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${sets.length <= 1 ? 'text-zinc-800 cursor-not-allowed' : 'text-zinc-600 hover:text-red-400 hover:bg-red-900/20'}`}
                            title="Delete set"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-2 mb-8">
                <button
                    onClick={addSet}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-900/50 px-5 py-3 rounded-2xl text-xs font-bold border border-zinc-800 border-dashed hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                >
                    + Add set
                </button>
            </div>

            {/* Footer Action */}
            <div className="mt-auto pt-4 pb-6">
                <Button
                    variant="primary"
                    fullWidth
                    onClick={handleFinish}
                    className="text-white rounded-full py-4 text-lg shadow-lg"
                    style={{ backgroundColor: appColor }}
                >
                    Log Workout
                </Button>
            </div>
        </div>
    );
}
