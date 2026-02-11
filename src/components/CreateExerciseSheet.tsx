import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Toggle } from './Toggle';
import { BottomSheet } from './BottomSheet';
import { useWorkoutStore } from '../store/workoutStore';
import { useThemeStore } from '../store/themeStore';
import { Palette, Repeat, Target, Weight, Activity, Dumbbell, Home as HomeIcon, Hourglass, Timer } from 'lucide-react';
import { ColorPicker } from './FormComponents';
import type { Exercise } from '../db/db';

import { useEquipmentStore, EQUIPMENT_OPTIONS } from '../store/equipmentStore';
import { MuscleGroupSheet } from './MuscleGroupSheet';
import { EquipmentSelectSheet } from './EquipmentSelectSheet';

// Counter component defined outside to prevent re-creation on every render
const Counter = ({ value, onChange, unit, themeColor }: { value: number, onChange: (v: number) => void, unit?: string, themeColor?: string }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value.toString());
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
    const valueRef = React.useRef(value);
    const isPressingRef = React.useRef(false);

    // Keep valueRef in sync with value prop
    React.useEffect(() => {
        valueRef.current = value;
    }, [value]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const stopIncrementing = () => {
        isPressingRef.current = false;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const startIncrementing = (increment: boolean) => {
        isPressingRef.current = true;
        // Immediate first action
        const newValue = increment ? value + 1 : Math.max(0, value - 1);
        onChange(newValue);
        valueRef.current = newValue;

        // Start continuous increment after 300ms delay
        timeoutRef.current = setTimeout(() => {
            if (!isPressingRef.current) return;
            intervalRef.current = setInterval(() => {
                if (!isPressingRef.current) {
                    stopIncrementing();
                    return;
                }
                const next = increment ? valueRef.current + 1 : Math.max(0, valueRef.current - 1);
                valueRef.current = next;
                onChange(next);
            }, 100);
        }, 300);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        const parsed = parseInt(inputValue, 10);
        onChange(isNaN(parsed) ? 0 : Math.max(0, parsed));
        setIsEditing(false);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            setInputValue(value.toString());
        }
    };

    // Update input value when prop value changes (only when not editing)
    React.useEffect(() => {
        if (!isEditing) {
            setInputValue(value.toString());
        }
    }, [value, isEditing]);

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onMouseDown={() => startIncrementing(false)}
                onMouseUp={stopIncrementing}
                onMouseLeave={stopIncrementing}
                onTouchStart={() => startIncrementing(false)}
                onTouchEnd={stopIncrementing}
                className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-zinc-700 active:scale-95 transition-all text-white select-none"
            >
                -
            </button>
            {isEditing ? (
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    className="bg-zinc-800 px-2 py-2 rounded-full w-16 text-center text-xs font-bold outline-none text-white"
                    style={{ boxShadow: `0 0 0 2px ${themeColor || '#3b82f6'}` }}
                    autoFocus
                />
            ) : (
                <div
                    onClick={() => setIsEditing(true)}
                    className="bg-zinc-800 px-3 py-2 rounded-full min-w-[3rem] text-center text-xs font-bold text-white cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                    {value === 0 ? '-' : value} {unit}
                </div>
            )}
            <button
                type="button"
                onMouseDown={() => startIncrementing(true)}
                onMouseUp={stopIncrementing}
                onMouseLeave={stopIncrementing}
                onTouchStart={() => startIncrementing(true)}
                onTouchEnd={stopIncrementing}
                className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-zinc-700 active:scale-95 transition-all text-white select-none"
            >
                +
            </button>
        </div>
    );
};

// TimeCounter component for time-based exercises (handles hours, minutes, seconds)
const TimeCounter = ({ value, onChange, themeColor }: { value: number, onChange: (v: number) => void, themeColor?: string }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
    const valueRef = React.useRef(value);
    const isPressingRef = React.useRef(false);

    // Convert seconds to hours, minutes, seconds
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    // Format time display
    const formatTime = () => {
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    };

    // Input state for editing
    const [inputH, setInputH] = React.useState(hours.toString());
    const [inputM, setInputM] = React.useState(minutes.toString());
    const [inputS, setInputS] = React.useState(seconds.toString());

    React.useEffect(() => { valueRef.current = value; }, [value]);

    React.useEffect(() => {
        if (!isEditing) {
            setInputH(Math.floor(value / 3600).toString());
            setInputM(Math.floor((value % 3600) / 60).toString());
            setInputS((value % 60).toString());
        }
    }, [value, isEditing]);

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const stopIncrementing = () => {
        isPressingRef.current = false;
        if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };

    const startIncrementing = (increment: boolean) => {
        isPressingRef.current = true;
        const step = 5;
        const newValue = increment ? value + step : Math.max(0, value - step);
        onChange(newValue);
        valueRef.current = newValue;
        timeoutRef.current = setTimeout(() => {
            if (!isPressingRef.current) return;
            intervalRef.current = setInterval(() => {
                if (!isPressingRef.current) { stopIncrementing(); return; }
                const next = increment ? valueRef.current + step : Math.max(0, valueRef.current - step);
                valueRef.current = next;
                onChange(next);
            }, 80);
        }, 300);
    };

    const handleSave = () => {
        const h = parseInt(inputH, 10) || 0;
        const m = parseInt(inputM, 10) || 0;
        const s = parseInt(inputS, 10) || 0;
        onChange(Math.max(0, h * 3600 + m * 60 + s));
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') { setIsEditing(false); setInputH(hours.toString()); setInputM(minutes.toString()); setInputS(seconds.toString()); }
    };

    return (
        <div className="flex items-center gap-2">
            <button type="button" onMouseDown={() => startIncrementing(false)} onMouseUp={stopIncrementing} onMouseLeave={stopIncrementing} onTouchStart={() => startIncrementing(false)} onTouchEnd={stopIncrementing} className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-zinc-700 active:scale-95 transition-all text-white select-none">-</button>
            {isEditing ? (
                <div
                    className="flex items-center gap-1 bg-zinc-800 px-2 py-1.5 rounded-full text-white"
                    style={{ boxShadow: `0 0 0 2px ${themeColor || '#3b82f6'}` }}
                    onBlur={(e) => {
                        // Only save if focus moves outside the container
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            handleSave();
                        }
                    }}
                >
                    <input type="text" inputMode="numeric" value={inputH} onChange={(e) => setInputH(e.target.value)} onKeyDown={handleKeyDown} className="bg-transparent w-6 text-center text-xs font-bold outline-none" maxLength={2} />
                    <span className="text-zinc-500 text-xs">h</span>
                    <input type="text" inputMode="numeric" value={inputM} onChange={(e) => setInputM(e.target.value)} onKeyDown={handleKeyDown} className="bg-transparent w-6 text-center text-xs font-bold outline-none" maxLength={2} />
                    <span className="text-zinc-500 text-xs">m</span>
                    <input type="text" inputMode="numeric" value={inputS} onChange={(e) => setInputS(e.target.value)} onKeyDown={handleKeyDown} className="bg-transparent w-6 text-center text-xs font-bold outline-none" maxLength={2} autoFocus />
                    <span className="text-zinc-500 text-xs">s</span>
                </div>
            ) : (
                <div onClick={() => setIsEditing(true)} className="bg-zinc-800 px-3 py-2 rounded-full min-w-[4rem] text-center text-xs font-bold text-white cursor-pointer hover:bg-zinc-700 transition-colors">{value === 0 ? '-' : formatTime()}</div>
            )}
            <button type="button" onMouseDown={() => startIncrementing(true)} onMouseUp={stopIncrementing} onMouseLeave={stopIncrementing} onTouchStart={() => startIncrementing(true)} onTouchEnd={stopIncrementing} className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-zinc-700 active:scale-95 transition-all text-white select-none">+</button>
        </div>
    );
};

interface CreateExerciseSheetProps {
    isOpen: boolean;
    onClose: () => void;
    editExercise?: Exercise | null; // Optional exercise data for editing
}

export const CreateExerciseSheet = ({ isOpen, onClose, editExercise }: CreateExerciseSheetProps) => {
    const { addExercise, updateExercise } = useWorkoutStore();
    const { appColor } = useThemeStore();

    const [name, setName] = useState('');
    const [color, setColor] = useState(appColor); // Exercise-specific color
    const [repType, setRepType] = useState<'reps' | 'time'>('reps');
    const [targetReps, setTargetReps] = useState(0);
    const [targetWeight, setTargetWeight] = useState(0);
    const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
    const [isMuscleGroupOpen, setIsMuscleGroupOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['Bodyweight']);
    const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);
    const [isHome, setIsHome] = useState(false);
    const [targetTime, setTargetTime] = useState(30); // seconds for time-based exercises

    // Pre-fill form data when editing
    useEffect(() => {
        if (isOpen && editExercise) {
            setName(editExercise.name || '');
            setColor(editExercise.color || appColor);
            setRepType(editExercise.rep_type || 'reps');
            setTargetReps(editExercise.target_reps || 0);
            setTargetWeight(editExercise.target_weight || 0);
            setMuscleGroups(editExercise.muscle_group ? editExercise.muscle_group.split(', ') : []);
            setSelectedEquipment(editExercise.equipment ? editExercise.equipment.split(', ') : ['Bodyweight']);
            setIsHome(editExercise.is_home || false);
            setTargetTime(editExercise.target_time || 30);
        } else if (isOpen && !editExercise) {
            // Reset form for new exercise
            setName('');
            setColor(appColor);
            setRepType('reps');
            setTargetReps(0);
            setTargetWeight(0);
            setMuscleGroups([]);
            setSelectedEquipment(['Bodyweight']);
            setIsHome(false);
            setTargetTime(30);
        }
    }, [isOpen, editExercise, appColor]);

    const handleCreate = () => {
        if (!name) return;

        const exerciseData = {
            id: editExercise ? editExercise.id : Date.now(),
            workoutId: 0,
            name,
            color,
            rep_type: repType,
            target_reps: targetReps,
            target_weight: targetWeight,
            muscle_group: muscleGroups.length > 0 ? muscleGroups.join(', ') : 'General',
            equipment: selectedEquipment.length > 0 ? selectedEquipment.join(', ') : 'Bodyweight',
            is_home: isHome,
            target_time: targetTime
        };

        if (editExercise) {
            updateExercise(exerciseData);
        } else {
            addExercise(exerciseData);
        }
        onClose();
    };

    const toggleMuscleGroup = (group: string) => {
        setMuscleGroups(prev =>
            prev.includes(group)
                ? prev.filter(g => g !== group)
                : [...prev, group]
        );
    };

    const toggleEquipment = (eq: string) => {
        setSelectedEquipment(prev =>
            prev.includes(eq)
                ? prev.filter(e => e !== eq)
                : [...prev, eq]
        );
    };


    const { selectedEquipment: availableEquipmentIds } = useEquipmentStore();

    // Validate selected equipment when available equipment changes or sheet opens
    useEffect(() => {
        if (isOpen) {
            // Get valid names based on available IDs
            const validNames = EQUIPMENT_OPTIONS
                .filter(opt => availableEquipmentIds.includes(opt.id))
                .map(opt => opt.name);

            // Filter current selection to only keep valid ones
            const validSelection = selectedEquipment.filter(name => validNames.includes(name));

            // Update if selection changed (length mismatch or different items)
            // Or if validSelection is empty but we're supposedly selecting things (prevents showing stale 'Bodyweight' if bodyweight is disabled)
            if (validSelection.length !== selectedEquipment.length) {
                setSelectedEquipment(validSelection);
            }
        }
    }, [isOpen, availableEquipmentIds, selectedEquipment]);

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="New exercise">
            {/* Name Input */}
            <input
                type="text"
                placeholder="Exercise name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold placeholder:text-zinc-700 outline-none mb-6 caret-white"
                style={{ color: name ? color : 'white' }}
            />

            <div className="space-y-4">
                {/* Color Selection */}
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                        <Palette className="text-zinc-500 w-5 h-5" />
                        <span className="font-bold text-white">Color</span>
                    </div>
                    <ColorPicker value={color} onChange={setColor} />
                </div>

                <div className="h-px bg-zinc-800" />

                {/* Rep Type */}
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                        <Repeat className="text-zinc-500 w-5 h-5" />
                        <span className="font-bold text-white">Rep Type</span>
                    </div>
                    <button
                        onClick={() => setRepType(repType === 'reps' ? 'time' : 'reps')}
                        className="bg-zinc-800 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-zinc-700 transition-colors text-white"
                    >
                        {repType === 'reps' ? <Repeat className="w-3 h-3" /> : <Hourglass className="w-3 h-3" />} {repType}
                    </button>
                </div>

                {repType === 'reps' && (
                    <>
                        <div className="h-px bg-zinc-800" />

                        {/* Rep Target */}
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <Target className="text-zinc-500 w-5 h-5" />
                                <span className="font-bold text-white">Rep target</span>
                            </div>
                            <Counter value={targetReps} onChange={setTargetReps} themeColor={color} />
                        </div>

                        {/* Weight Target */}
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <Weight className="text-zinc-500 w-5 h-5" />
                                <span className="font-bold text-white">Weight target</span>
                            </div>
                            <Counter value={targetWeight} onChange={setTargetWeight} unit="kg" themeColor={color} />
                        </div>
                    </>
                )}

                {repType === 'time' && (
                    <>
                        <div className="h-px bg-zinc-800" />

                        {/* Rep Time */}
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <Timer className="text-zinc-500 w-5 h-5" />
                                <span className="font-bold text-white">Rep time</span>
                            </div>
                            <TimeCounter value={targetTime} onChange={setTargetTime} themeColor={color} />
                        </div>
                    </>
                )}

                {/* Muscle Group */}
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                        <Activity className="text-zinc-500 w-5 h-5" />
                        <span className="font-bold text-white">Muscle group</span>
                    </div>
                    <button
                        onClick={() => setIsMuscleGroupOpen(true)}
                        className="bg-zinc-800 px-4 py-2 rounded-full min-w-[3rem] text-center text-xs font-bold hover:bg-zinc-700 transition-colors text-white truncate max-w-[150px]"
                    >
                        {muscleGroups.length > 0
                            ? (muscleGroups.length > 2 ? `${muscleGroups.length} selected` : muscleGroups.join(', '))
                            : 'Select'}
                    </button>
                </div>

                <div className="h-px bg-zinc-800" />

                {/* Equipment */}
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                        <Dumbbell className="text-zinc-500 w-5 h-5" />
                        <span className="font-bold text-white">Equipment</span>
                    </div>
                    <button
                        onClick={() => setIsEquipmentOpen(true)}
                        className="bg-zinc-800 px-4 py-2 rounded-full min-w-[3rem] text-center text-xs font-bold hover:bg-zinc-700 transition-colors text-white truncate max-w-[150px]"
                    >
                        {selectedEquipment.length > 0
                            ? (selectedEquipment.length > 1 ? `${selectedEquipment.length} selected` : selectedEquipment[0])
                            : 'Select'}
                    </button>
                </div>

                <div className="h-px bg-zinc-800" />

                {/* Add Home */}
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                        <HomeIcon className="text-zinc-500 w-5 h-5" />
                        <span className="font-bold text-white">Add to Home</span>
                    </div>
                    <Toggle checked={isHome} onCheckedChange={setIsHome} />
                </div>

            </div>

            {/* Create Button */}
            <Button
                fullWidth
                className="mt-8 text-white shadow-lg font-bold py-4 rounded-2xl transition-all"
                style={{
                    backgroundColor: name ? appColor : appColor,
                    opacity: name ? 1 : 0.5
                }}
                onClick={handleCreate}
                disabled={!name}
            >
                Create exercise
            </Button>

            <MuscleGroupSheet
                isOpen={isMuscleGroupOpen}
                onClose={() => setIsMuscleGroupOpen(false)}
                selectedGroups={muscleGroups}
                onToggle={toggleMuscleGroup}
            />

            <EquipmentSelectSheet
                isOpen={isEquipmentOpen}
                onClose={() => setIsEquipmentOpen(false)}
                selectedEquipment={selectedEquipment}
                onToggle={toggleEquipment}
            />
        </BottomSheet>
    );
};
