import { Hourglass, Play } from 'lucide-react';
import type { Exercise } from '../db/db';

interface ExerciseRowProps {
    exercise: Exercise;
    onLog?: () => void;
}

export const ExerciseRow = ({ exercise, onLog }: ExerciseRowProps) => {
    // ... logic remains ...

    return (
        <div className="flex items-center gap-4 py-3">
            {/* Left content ... */}
            <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: exercise.color || '#333' }}
            >
                <span className="text-xs font-bold text-white/50">Img</span>
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-base truncate">{exercise.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-zinc-500 text-xs font-bold tracking-wider">
                        {exercise.rep_type === 'time' ? (
                            <div className="flex items-center gap-1">
                                <Hourglass className="w-3 h-3" />
                                <span>{exercise.target_time}s</span>
                            </div>
                        ) : (
                            `${exercise.target_reps} reps`
                        )}
                    </span>
                </div>
            </div>

            {/* Weight */}
            {exercise.target_weight > 0 && (
                <div className="text-zinc-500 text-xs font-bold mr-2">
                    {exercise.target_weight}kg
                </div>
            )}

            {/* Log Button */}
            {onLog && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onLog();
                    }}
                    className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-colors shrink-0"
                >
                    <Play className="w-4 h-4 fill-white" />
                </button>
            )}
        </div>
    );
};
