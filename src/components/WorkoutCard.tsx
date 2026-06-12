import { Button } from './Button';
import { ArrowRight } from 'lucide-react';
import type { Workout } from '../db/db';

interface WorkoutCardProps {
    workout: Workout;
    date: Date;
    onTrain: () => void;
    queueLabel?: string; // e.g. "1 of 2"
}

export const WorkoutCard = ({ workout, date, onTrain, queueLabel }: WorkoutCardProps) => {
    // Format date: "28" and "SUN"
    const dayOfMonth = date.getDate();
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

    return (
        <div className="w-full relative overflow-hidden rounded-[32px] p-4 flex items-center justify-between gap-4">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#fabc7a] to-[#ff8e8e]" />

            {/* Content Group (Date + Info) */}
            <div className="relative z-10 flex items-center gap-4 flex-1">
                {/* Date Badge */}
                <div className="bg-black/90 text-white rounded-2xl flex flex-col items-center justify-center w-14 h-14 shrink-0">
                    <span className="text-xl font-bold leading-none">{dayOfMonth}</span>
                    <span className="text-[9px] font-bold text-zinc-400 mt-0.5">{dayOfWeek}</span>
                </div>

                <div className="flex flex-col items-start gap-1">
                    <h3 className="text-white font-bold text-lg leading-tight">Training day</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="bg-black/20 backdrop-blur-md px-3 py-0.5 rounded-full text-[10px] font-medium text-white/90 border border-white/10">
                            {workout.name}
                        </span>
                        {queueLabel && (
                            <span className="bg-black/20 backdrop-blur-md px-3 py-0.5 rounded-full text-[10px] font-medium text-white/90 border border-white/10">
                                {queueLabel}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Train Button */}
            <div className="relative z-10 shrink-0">
                <Button
                    variant="primary"
                    className="bg-white text-black hover:bg-zinc-100 rounded-full py-2 px-5 text-sm font-bold flex items-center gap-2"
                    onClick={onTrain}
                >
                    <div className="bg-black rounded-full w-4 h-4 flex items-center justify-center">
                        <ArrowRight className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                    Train
                </Button>
            </div>
        </div>
    );
};
