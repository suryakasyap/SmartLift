import { useRef, useEffect, useState } from 'react';

interface ScrollClockProps {
    initialTime: string; // "HH:MM" (always 24h)
    onChange: (time: string) => void;
    format: '12h' | '24h';
}

export const ScrollClock = ({ initialTime, onChange, format }: ScrollClockProps) => {
    // Parse initial time
    const [initialH, initialM] = initialTime.split(':').map(Number);

    // State for display values (always stored as 24h internally)
    const [hour24, setHour24] = useState(isNaN(initialH) ? 18 : initialH);
    const [minute, setMinute] = useState(isNaN(initialM) ? 30 : initialM);

    // Derived state for 12h
    const [ampm, setAmpm] = useState<'AM' | 'PM'>(hour24 >= 12 ? 'PM' : 'AM');

    const ITEM_HEIGHT = 48;
    const LOOP_COUNT = 20; // Repeat arrays 20 times for smooth infinite scroll

    // Base arrays
    const baseHours24 = Array.from({ length: 24 }, (_, i) => i); // 0-23
    const baseHours12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
    const baseMinutes = Array.from({ length: 60 }, (_, i) => i); // 0-59
    const ampms = ['AM', 'PM'] as const; // Not looped

    // Looped arrays for display
    const hours24 = Array(LOOP_COUNT).fill(baseHours24).flat();
    const hours12 = Array(LOOP_COUNT).fill(baseHours12).flat();
    const minutes = Array(LOOP_COUNT).fill(baseMinutes).flat();

    // Refs
    const hourRef = useRef<HTMLDivElement>(null);
    const minuteRef = useRef<HTMLDivElement>(null);
    const ampmRef = useRef<HTMLDivElement>(null);

    // Calculate middle offset for initial scroll position
    const getMiddleIndex = (value: number, baseLength: number) => {
        const middleSet = Math.floor(LOOP_COUNT / 2);
        return (middleSet * baseLength) + value;
    };

    // Scroll to correct position on mount and format change
    useEffect(() => {
        if (format === '24h') {
            if (hourRef.current) {
                const targetIndex = getMiddleIndex(hour24, 24);
                hourRef.current.scrollTop = targetIndex * ITEM_HEIGHT;
            }
        } else {
            const h12 = hour24 % 12 || 12;
            const hIndex = baseHours12.indexOf(h12);
            if (hourRef.current) {
                const targetIndex = getMiddleIndex(hIndex, 12);
                hourRef.current.scrollTop = targetIndex * ITEM_HEIGHT;
            }

            if (ampmRef.current) {
                const ampmIndex = hour24 >= 12 ? 1 : 0;
                ampmRef.current.scrollTop = ampmIndex * ITEM_HEIGHT;
            }
        }

        if (minuteRef.current) {
            const targetIndex = getMiddleIndex(minute, 60);
            minuteRef.current.scrollTop = targetIndex * ITEM_HEIGHT;
        }
    }, [format]);

    // Initial scroll on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            if (format === '24h') {
                if (hourRef.current) {
                    const targetIndex = getMiddleIndex(hour24, 24);
                    hourRef.current.scrollTop = targetIndex * ITEM_HEIGHT;
                }
            } else {
                const h12 = hour24 % 12 || 12;
                const hIndex = baseHours12.indexOf(h12);
                if (hourRef.current) {
                    const targetIndex = getMiddleIndex(hIndex, 12);
                    hourRef.current.scrollTop = targetIndex * ITEM_HEIGHT;
                }

                if (ampmRef.current) {
                    const ampmIndex = hour24 >= 12 ? 1 : 0;
                    ampmRef.current.scrollTop = ampmIndex * ITEM_HEIGHT;
                }
            }

            if (minuteRef.current) {
                const targetIndex = getMiddleIndex(minute, 60);
                minuteRef.current.scrollTop = targetIndex * ITEM_HEIGHT;
            }
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    // Notify parent always in 24h format
    const updateTime = (h: number, m: number) => {
        const safeH = Math.max(0, Math.min(23, h));
        const safeM = Math.max(0, Math.min(59, m));
        const hStr = safeH.toString().padStart(2, '0');
        const mStr = safeM.toString().padStart(2, '0');
        onChange(`${hStr}:${mStr}`);
    };

    const handleScroll = (type: 'hour' | 'minute' | 'ampm', e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const index = Math.round(target.scrollTop / ITEM_HEIGHT);

        if (type === 'hour') {
            if (format === '24h') {
                // Use modulo to get actual hour value (0-23)
                const newH = index % 24;
                if (newH !== hour24) {
                    setHour24(newH);
                    updateTime(newH, minute);
                }
            } else {
                // 12h format: index in looped array of 1-12
                const indexInBase = index % 12;
                const newH12 = baseHours12[indexInBase]; // 1-12

                let newH24 = newH12;
                if (ampm === 'PM' && newH12 !== 12) newH24 += 12;
                if (ampm === 'AM' && newH12 === 12) newH24 = 0;

                if (newH24 !== hour24) {
                    setHour24(newH24);
                    updateTime(newH24, minute);
                }
            }
        } else if (type === 'minute') {
            // Use modulo to get actual minute value (0-59)
            const newM = index % 60;
            if (newM !== minute) {
                setMinute(newM);
                updateTime(hour24, newM);
            }
        } else if (type === 'ampm') {
            // AM/PM is not looped
            const clampedIndex = Math.max(0, Math.min(1, index));
            const newAmpm = ampms[clampedIndex];
            if (newAmpm && newAmpm !== ampm) {
                setAmpm(newAmpm);
                let newH24 = hour24;
                if (newAmpm === 'PM' && hour24 < 12) newH24 += 12;
                if (newAmpm === 'AM' && hour24 >= 12) newH24 -= 12;

                setHour24(newH24);
                updateTime(newH24, minute);
            }
        }
    };

    return (
        <div className="relative h-48 w-full flex justify-center text-white select-none">
            {/* Selection Overlay */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-12 bg-zinc-800/50 rounded-lg pointer-events-none" />

            <div className="flex gap-8 font-mono text-3xl font-bold z-10">
                {/* Hours Column */}
                <div
                    ref={hourRef}
                    className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide py-[72px]"
                    style={{ scrollbarWidth: 'none' }}
                    onScroll={(e) => handleScroll('hour', e)}
                >
                    {(format === '24h' ? hours24 : hours12).map((h, i) => (
                        <div key={i} className="h-12 flex items-center justify-center snap-center w-16">
                            {h.toString().padStart(2, '0')}
                        </div>
                    ))}
                </div>

                <div className="flex items-center pb-2">:</div>

                {/* Minutes Column */}
                <div
                    ref={minuteRef}
                    className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide py-[72px]"
                    style={{ scrollbarWidth: 'none' }}
                    onScroll={(e) => handleScroll('minute', e)}
                >
                    {minutes.map((m, i) => (
                        <div key={i} className="h-12 flex items-center justify-center snap-center w-16">
                            {m.toString().padStart(2, '0')}
                        </div>
                    ))}
                </div>

                {/* AM/PM Column (Only in 12h mode) */}
                {format === '12h' && (
                    <div
                        ref={ampmRef}
                        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide py-[72px] ml-4 border-l border-zinc-800 pl-4"
                        style={{ scrollbarWidth: 'none' }}
                        onScroll={(e) => handleScroll('ampm', e)}
                    >
                        {ampms.map((p, i) => (
                            <div key={i} className="h-12 flex items-center justify-center snap-center w-16 text-xl text-zinc-400">
                                {p}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
