import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { Toggle } from '../components/Toggle';
import { useWorkoutStore } from '../store/workoutStore';
import { useThemeStore } from '../store/themeStore'; // Import theme store
import { Palette, Repeat, Target, Weight, Activity, Dumbbell, Home as HomeIcon, Hourglass, Timer, ChevronLeft, Layers } from 'lucide-react'; // Import icons
import { ColorPicker } from '../components/FormComponents'; // Import ColorPicker

import { Counter, TimeCounter } from '../components/Inputs';

export default function CreateExercise() {
    const navigate = useNavigate();
    const location = useLocation();
    const editExercise = location.state?.exercise;

    const { addExercise, updateExercise } = useWorkoutStore();
    const { appColor } = useThemeStore(); // Get default theme color

    const [name, setName] = useState(editExercise?.name || '');
    const [color, setColor] = useState(editExercise?.color || ''); // Add color state
    const [repType, setRepType] = useState<'reps' | 'time'>(editExercise?.rep_type || 'reps');
    const [targetReps, setTargetReps] = useState(editExercise?.target_reps || 0);
    const [targetWeight, setTargetWeight] = useState(editExercise?.target_weight || 0);
    // Parse muscle group and equipment if they are strings
    const [muscleGroup, setMuscleGroup] = useState(editExercise?.muscle_group || '');
    const [equipment, setEquipment] = useState(editExercise?.equipment || 'Bodyweight');
    const [isHome, setIsHome] = useState(editExercise?.is_home || false);
    const [targetTime, setTargetTime] = useState(editExercise?.target_time || 30); // seconds
    const [targetSets, setTargetSets] = useState(editExercise?.target_sets || 3); // sets for time-based

    // Initialize color with appColor on mount only if not editing
    useEffect(() => {
        if (!editExercise) {
            setColor(appColor);
        }
    }, [appColor, editExercise]);

    const handleCreate = () => {
        if (!name) return;

        const exerciseData = {
            id: editExercise ? editExercise.id : Date.now(),
            workoutId: 0,
            name,
            illustration: undefined,
            color,
            rep_type: repType,
            target_reps: targetReps,
            target_weight: targetWeight,
            target_time: targetTime,
            target_sets: targetSets,
            muscle_group: muscleGroup || 'General',
            equipment,
            is_home: isHome
        };

        if (editExercise) {
            updateExercise(exerciseData);
        } else {
            addExercise(exerciseData);
        }
        navigate(-1);
    };


    return (
        <div className="min-h-screen bg-background p-6 pb-8 text-white flex flex-col">
            <div className="flex items-center justify-center relative mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center -ml-2 text-zinc-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="w-12 h-1 bg-zinc-800 rounded-full absolute -top-2" />
                <h1 className="text-lg font-bold">{editExercise ? 'Edit exercise' : 'New exercise'}</h1>
            </div>

            <input
                type="text"
                placeholder="Exercise name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-transparent text-3xl font-bold placeholder:text-zinc-700 outline-none mb-8 caret-primary"
                style={{ color: name ? color : undefined }}
            />

            <div className="space-y-6">
                {/* Color Selection */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Palette className="text-zinc-500 w-5 h-5" />
                        <span className="font-bold">Color</span>
                    </div>
                    <div>
                        <ColorPicker value={color} onChange={setColor} />
                    </div>
                </div>

                <div className="h-px bg-zinc-900" />

                {/* Rep Type */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Repeat className="text-zinc-500 w-5 h-5" />
                        <span className="font-bold">Rep Type</span>
                    </div>
                    <button
                        onClick={() => setRepType(repType === 'reps' ? 'time' : 'reps')}
                        className="bg-zinc-800 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-zinc-700 transition-colors"
                    >
                        {repType === 'reps' ? <Repeat className="w-3 h-3" /> : <Hourglass className="w-3 h-3" />} {repType}
                    </button>
                </div>

                {repType === 'reps' && (
                    <>
                        <div className="h-px bg-zinc-900" />

                        {/* Rep Target */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Target className="text-zinc-500 w-5 h-5" />
                                <span className="font-bold">Rep target</span>
                            </div>
                            <Counter value={targetReps} onChange={setTargetReps} themeColor={color} />
                        </div>

                        {/* Weight Target */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Weight className="text-zinc-500 w-5 h-5" />
                                <span className="font-bold">Weight target</span>
                            </div>
                            <Counter value={targetWeight} onChange={setTargetWeight} unit="kg" themeColor={color} />
                        </div>
                    </>
                )}

                {repType === 'time' && (
                    <>
                        <div className="h-px bg-zinc-900" />

                        {/* Rep Time */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Timer className="text-zinc-500 w-5 h-5" />
                                <span className="font-bold">Rep time</span>
                            </div>
                            <TimeCounter value={targetTime} onChange={setTargetTime} themeColor={color} />
                        </div>

                        <div className="h-px bg-zinc-900" />

                        {/* Target Sets */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Layers className="text-zinc-500 w-5 h-5" />
                                <span className="font-bold">Target sets</span>
                            </div>
                            <Counter value={targetSets} onChange={setTargetSets} themeColor={color} />
                        </div>
                    </>
                )}

                {/* Muscle Group */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Activity className="text-zinc-500 w-5 h-5" />
                        <span className="font-bold">Muscle group</span>
                    </div>
                    <button onClick={() => setMuscleGroup((m: string) => m === 'Chest' ? 'Back' : m === 'Back' ? 'Legs' : 'Chest')} className="bg-zinc-800 px-4 py-2 rounded-full min-w-[3rem] text-center text-xs font-bold hover:bg-zinc-700 transition-colors">
                        {muscleGroup || '-'}
                    </button>
                </div>

                <div className="h-px bg-zinc-900" />

                {/* Equipment */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Dumbbell className="text-zinc-500 w-5 h-5" />
                        <span className="font-bold">Equipment</span>
                    </div>
                    <button onClick={() => setEquipment((e: string) => e === 'Bodyweight' ? 'Dumbbell' : 'Bodyweight')} className="bg-zinc-800 px-4 py-2 rounded-full text-xs font-bold hover:bg-zinc-700 transition-colors">
                        {equipment}
                    </button>
                </div>

                <div className="h-px bg-zinc-900" />

                {/* Add Home */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <HomeIcon className="text-zinc-500 w-5 h-5" />
                        <span className="font-bold">Add to Home</span>
                    </div>
                    <Toggle checked={isHome} onCheckedChange={setIsHome} />
                </div>

            </div>

            <Button
                fullWidth
                className="mt-auto w-full shadow-2xl shadow-primary/20"
                onClick={handleCreate}
                disabled={!name}
            >
                {editExercise ? 'Update exercise' : 'Create exercise'}
            </Button>
        </div>
    );
}
