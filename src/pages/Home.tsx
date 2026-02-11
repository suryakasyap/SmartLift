import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { CalendarGrid } from '../components/CalendarGrid';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Exercise, type Workout } from '../db/db';
import { CreateWorkoutSheet } from '../components/CreateWorkoutSheet';
import { CreateExerciseSheet } from '../components/CreateExerciseSheet';
import { WorkoutCard } from '../components/WorkoutCard';
import { ExerciseRow } from '../components/ExerciseRow';
import { Clock, Pencil, Trash2 } from 'lucide-react';

import { useUserStore } from '../store/userStore';
import { useDevStore } from '../store/devStore';
import { useThemeStore } from '../store/themeStore';
import { isWorkoutScheduled } from '../lib/scheduler';

// Sub-component: renders one workout section with its unlogged exercises
function TodayWorkoutSection({ workout, loggedExerciseNames }: { workout: Workout; loggedExerciseNames: Set<string> }) {
    const navigate = useNavigate();
    const exercises = useLiveQuery(
        () => db.exercises.where('workoutId').equals(workout.id).toArray(),
        [workout.id]
    );

    if (!exercises) return null;

    // Filter out exercises that have already been logged today
    const remaining = exercises.filter(ex => !loggedExerciseNames.has(ex.name));

    // All exercises logged → hide this workout section entirely
    if (remaining.length === 0) return null;

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">{workout.name}</h2>
                <div className="flex items-center gap-1.5 text-zinc-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold font-mono">
                        {workout.reminder_time || "45:00"}
                    </span>
                </div>
            </div>
            <div className="border border-zinc-800 border-dashed mb-4" />
            <div className="divide-y divide-zinc-800/50">
                {remaining.map((exercise: Exercise) => (
                    <ExerciseRow
                        key={exercise.id}
                        exercise={exercise}
                        onLog={() => {
                            navigate(`/workout/${workout.id}`, { state: { exerciseId: exercise.id } });
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const workouts = useLiveQuery(() => db.workouts.toArray());
    const logs = useLiveQuery(() => db.workoutLogs.toArray());

    const hasWorkouts = workouts && workouts.length > 0;

    const [isWorkoutSheetOpen, setIsWorkoutSheetOpen] = useState(false);
    const [isExerciseSheetOpen, setIsExerciseSheetOpen] = useState(false);
    const [editExercise, setEditExercise] = useState<Exercise | null>(null);
    const [activeTab, setActiveTab] = useState<'today' | 'favorites'>('today');

    const { name } = useUserStore();
    const { getSystemDate } = useDevStore();
    const systemDate = getSystemDate();
    const { appColor } = useThemeStore();

    // Determine today's workouts (all scheduled for today)
    const today = useMemo(() => new Date(systemDate), [systemDate]);
    const todayWorkouts = useMemo(() => {
        if (!workouts) return [];
        return workouts.filter(w => isWorkoutScheduled(w, today));
    }, [workouts, today]);

    // Filter out completed workouts (stack behavior)
    const remainingWorkouts = useMemo(() => {
        if (!logs) return todayWorkouts;
        const todayStr = today.toDateString();
        const completedIds = new Set(
            logs.filter(l => new Date(l.date).toDateString() === todayStr)
                .map(l => l.workoutId)
        );
        return todayWorkouts.filter(w => !completedIds.has(w.id));
    }, [todayWorkouts, logs, today]);

    // Active workout = first remaining in the stack (for the Training Card)
    const activeWorkout = remainingWorkouts.length > 0 ? remainingWorkouts[0] : null;

    // Get logged exercise names for today, grouped by workoutId
    const loggedExercisesByWorkout = useMemo(() => {
        if (!logs) return new Map<number, Set<string>>();
        const todayStr = today.toDateString();
        const map = new Map<number, Set<string>>();
        logs.filter(l => new Date(l.date).toDateString() === todayStr).forEach(l => {
            if (!map.has(l.workoutId)) map.set(l.workoutId, new Set());
            const nameSet = map.get(l.workoutId)!;
            l.exercises?.forEach(ex => nameSet.add(ex.name));
        });
        return map;
    }, [logs, today]);

    // Streak Calculation
    const streak = useMemo(() => {
        if (!logs || !workouts) return 0;

        let currentStreak = 0;
        const d = new Date(systemDate);
        d.setHours(0, 0, 0, 0);

        const isCompleted = (date: Date) => {
            const dateStr = date.toDateString();
            return logs.some(l => new Date(l.date).toDateString() === dateStr);
        };

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(d);
            checkDate.setDate(checkDate.getDate() - i);

            const planned = workouts.some(w => isWorkoutScheduled(w, checkDate));
            const completed = isCompleted(checkDate);

            if (i === 0) {
                if (completed) currentStreak++;
                else if (!planned) continue;
                else continue;
            } else {
                if (completed) currentStreak++;
                else {
                    if (planned) break;
                    else continue;
                }
            }
        }
        return currentStreak;
    }, [logs, workouts, systemDate]);

    // Animated Streak
    const [animatedStreak, setAnimatedStreak] = useState(0);

    useEffect(() => {
        const start = 0;
        const end = streak;
        if (start === end) {
            setAnimatedStreak(end);
            return;
        }

        const duration = 800;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);

            setAnimatedStreak(Math.floor(ease * end));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setAnimatedStreak(end);
            }
        };
        requestAnimationFrame(animate);
    }, [streak]);

    return (
        <>
            <div className="min-h-screen bg-black p-6 pb-24 text-white">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Hey, {name}</h1>
                        <p className="text-zinc-400 font-semibold mt-1">
                            You are on a <span style={{ color: appColor }} className="font-bold">{animatedStreak} days streak.</span>
                        </p>
                    </div>
                    <div
                        className="cursor-pointer text-zinc-400 hover:text-white transition-colors mt-4"
                        onClick={() => navigate('/settings')}
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-400">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2L20.6603 7V17L12 22L3.33975 17V7L12 2ZM12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5Z" />
                        </svg>
                    </div>
                </div>

                <div className="mb-8">
                    <CalendarGrid workouts={workouts} logs={logs} />
                </div>

                {!hasWorkouts ? (
                    <div className="flex flex-col items-center justify-center mt-10 space-y-4">
                        <h2 className="text-xl font-bold">No workout</h2>
                        <p className="text-zinc-500 text-center text-sm px-6">
                            You don't have any workout. Create your first workout and start training.
                        </p>
                        <Button
                            variant="primary"
                            className="px-8 mt-4 bg-white text-black hover:bg-gray-200 py-3 rounded-full font-bold text-sm"
                            onClick={() => setIsWorkoutSheetOpen(true)}
                        >
                            Create workout
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Training Card - Only show if activeTab is 'today' */}
                        {activeTab === 'today' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {todayWorkouts.length === 0 ? (
                                    /* No workouts scheduled at all */
                                    <div className="bg-zinc-900 rounded-[32px] p-6 h-32 flex items-center justify-center border border-zinc-800 border-dashed">
                                        <div className="text-center">
                                            <p className="text-white font-bold text-lg">Rest Day</p>
                                            <p className="text-zinc-500 text-xs">No workouts scheduled for today.</p>
                                        </div>
                                    </div>
                                ) : activeWorkout ? (
                                    /* Active workout in the stack */
                                    <WorkoutCard
                                        workout={activeWorkout}
                                        date={today}
                                        onTrain={() => {
                                            navigate(`/workout/${activeWorkout.id}`);
                                        }}
                                        queueLabel={todayWorkouts.length > 1 ? `${todayWorkouts.length - remainingWorkouts.length + 1} of ${todayWorkouts.length}` : undefined}
                                    />
                                ) : (
                                    /* All workouts completed */
                                    <div className="bg-zinc-900 rounded-[32px] p-6 h-32 flex items-center justify-center border border-zinc-800">
                                        <div className="text-center">
                                            <p className="text-lg font-bold" style={{ color: appColor }}>All Done! 🎉</p>
                                            <p className="text-zinc-500 text-xs mt-1">{todayWorkouts.length} workout{todayWorkouts.length > 1 ? 's' : ''} completed today.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tabs & Content */}
                        <div>
                            <div className="flex items-center gap-6 mb-6 border-b border-zinc-800/50 pb-2">
                                <button
                                    onClick={() => setActiveTab('today')}
                                    className={`text-lg font-bold pb-2 -mb-2.5 transition-colors ${activeTab === 'today' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => setActiveTab('favorites')}
                                    className={`text-lg font-bold pb-2 -mb-2.5 transition-colors ${activeTab === 'favorites' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    My Workouts
                                </button>
                            </div>

                            {activeTab === 'today' ? (
                                todayWorkouts.length > 0 ? (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                        {todayWorkouts.map(w => (
                                            <TodayWorkoutSection
                                                key={w.id}
                                                workout={w}
                                                loggedExerciseNames={loggedExercisesByWorkout.get(w.id) || new Set()}
                                            />
                                        ))}

                                        <Button
                                            variant="secondary"
                                            className="w-12 h-12 rounded-full bg-zinc-800 text-white flex items-center justify-center mx-auto hover:bg-zinc-700 transition-colors"
                                            onClick={() => setIsWorkoutSheetOpen(true)}
                                        >
                                            <span className="text-2xl leading-none mb-1">+</span>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 bg-zinc-900/30 rounded-2xl">
                                        <p className="text-zinc-500 text-sm mb-4">No workout details for today.</p>
                                        <Button
                                            variant="secondary"
                                            className="bg-zinc-800 text-white hover:bg-zinc-700 py-2 px-6 rounded-full font-bold text-xs"
                                            onClick={() => setActiveTab('favorites')}
                                        >
                                            Check My Workouts
                                        </Button>
                                    </div>
                                )
                            ) : (
                                // Favorites List
                                <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
                                    {workouts?.map(w => (
                                        <div
                                            key={w.id}
                                            className="bg-zinc-900 p-4 rounded-2xl flex items-center justify-between border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group"
                                            onClick={() => {
                                                // TODO: Navigate to details or start?
                                            }}
                                        >
                                            <div>
                                                <h3 className="font-bold text-white mb-1">{w.name}</h3>
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-bold">
                                                        {w.planning_type === 'week_days' ? w.week_days.map(d => d.slice(0, 3).toUpperCase()).join(', ') : (w.planning_type === 'spacing' ? `Every ${w.spacing_days} days` : 'Not planned')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate('/create-workout', { state: { workout: w } });
                                                    }}
                                                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`Delete "${w.name}"?`)) {
                                                            await db.workouts.delete(w.id);
                                                            await db.exercises.where('workoutId').equals(w.id).delete();
                                                            await db.workoutLogs.where('workoutId').equals(w.id).delete();
                                                        }
                                                    }}
                                                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="primary"
                                        className="mt-4 bg-white text-black hover:bg-zinc-200 py-3 rounded-xl font-bold text-sm w-full"
                                        onClick={() => setIsWorkoutSheetOpen(true)}
                                    >
                                        + New Workout
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Sheets */}
            <CreateWorkoutSheet
                isOpen={isWorkoutSheetOpen}
                onClose={() => setIsWorkoutSheetOpen(false)}
                onExerciseAdd={() => {
                    setEditExercise(null);
                    setIsExerciseSheetOpen(true);
                }}
                onExerciseEdit={(exercise) => {
                    setEditExercise(exercise);
                    setIsExerciseSheetOpen(true);
                }}
            />
            <CreateExerciseSheet
                isOpen={isExerciseSheetOpen}
                onClose={() => {
                    setIsExerciseSheetOpen(false);
                    setEditExercise(null);
                }}
                editExercise={editExercise}
            />
        </>
    );
}
