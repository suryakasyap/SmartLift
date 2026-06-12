import { useState } from 'react';
import { cn } from '../lib/utils';
import { ChevronLeft, ChevronRight, Dumbbell, Check } from 'lucide-react';
import type { Workout, WorkoutLog } from '../db/db';
import { useDevStore } from '../store/devStore';
import { isWorkoutScheduled } from '../lib/scheduler';

interface CalendarGridProps {
    workouts?: Workout[];
    logs?: WorkoutLog[];
}

export const CalendarGrid = ({ workouts = [], logs = [] }: CalendarGridProps) => {
    const { systemDate } = useDevStore();
    const [currentDate, setCurrentDate] = useState(new Date(systemDate));

    // Update currentDate if systemDate significantly changes (e.g. month jump)
    // Optional: useEffect to sync if helpful, but useState init is okay for now if we navigate back/forth manually.
    // Better: Effect to reset view to systemDate when it changes?
    // Let's rely on user navigating, or reset logic.
    // Actually, if I change date in settings, I expect Home to show that date's month.
    // So let's add effect.
    // Note: 'currentDate' tracks the VIEWED month.

    // Logic for 'isToday'
    const today = new Date(systemDate);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const startOfMonth = new Date(year, month, 1);
    // Days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Calculate offset for Monday start (0=Sun, 1=Mon, ..., 6=Sat)
    // We want Mon=0, ..., Sun=6
    let startDayOfWeek = startOfMonth.getDay(); // 0 is Sunday
    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    // Navigation
    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };
    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    // Logic to check if a day is planned
    const isPlanned = (date: Date) => {
        if (!workouts) return false;
        return workouts.some(w => isWorkoutScheduled(w, date));
    };

    // Logic to check if a day is completed
    const isCompleted = (date: Date) => {
        if (!logs) return false;
        return logs.some(l => isSameDay(new Date(l.date), date));
    };

    // Generate days
    const calendarDays = [];
    for (let i = 0; i < offset; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        calendarDays.push({
            date: d,
            isToday: isSameDay(d, today),
            planned: isPlanned(d),
            completed: isCompleted(d)
        });
    }

    const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <div className="w-full select-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <span className="font-bold text-lg">{monthNames[month]} {year}</span>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-1 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextMonth} className="p-1 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-2">
                {weekDays.map((d, i) => (
                    <div key={i} className="text-center text-zinc-500 text-[10px] font-bold">
                        {d}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((day, i) => {
                    if (!day) {
                        return <div key={i} className="aspect-[4/3]" />; // Empty slot
                    }

                    // Styles
                    let bgClass = "bg-zinc-900"; // Default empty
                    let icon = null;

                    if (day.completed) {
                        bgClass = "bg-[#fabc7a] text-black"; // Orange completed
                        icon = <Check className="w-3.5 h-3.5 stroke-[4]" />; // Bold check
                    } else if (day.planned) {
                        if (day.date < today && !day.isToday) {
                            // Missed workout - logic? 
                            // Image shows white box with dumbbell for 'Training day' at bottom, but grid shows Check or Dumbbell.
                            // Image shows: Orange Check (Done), Gray Dumbbell? No, image has "Gray with Dumbbell" or "White with Dumbbell"?
                            // Actually the image shows:
                            //  - Orange + Check: Done
                            //  - Gray + Dumbbell: Planned (Future?)
                            //  - White + Dumbbell: Active/Today? (The one selected?)

                            // Let's use Gray + Dumbbell for planned.
                            bgClass = "bg-zinc-800 text-zinc-500";
                            icon = <Dumbbell className="w-3.5 h-3.5 fill-current" />;
                        } else {
                            // Future planned
                            bgClass = "bg-zinc-800 text-zinc-500";
                            if (day.isToday) {
                                // Today planned but not done
                                bgClass = "bg-white text-black";
                                icon = <Dumbbell className="w-3.5 h-3.5 fill-current" />;
                            } else {
                                icon = <Dumbbell className="w-3.5 h-3.5 fill-current" />;
                            }
                        }
                    } else {
                        // Not planned
                        if (day.isToday) {
                            bgClass = "bg-zinc-800 border border-zinc-700"; // Highlight today slightly if empty
                        }
                    }

                    return (
                        <div
                            key={i}
                            className={cn(
                                "aspect-[4/3] rounded-md flex items-center justify-center transition-all",
                                bgClass
                            )}
                        >
                            {icon}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
