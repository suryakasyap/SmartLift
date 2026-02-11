import { useState, useEffect, useRef } from 'react';

export const Counter = ({ value, onChange, unit, themeColor }: { value: number, onChange: (v: number) => void, unit?: string, themeColor?: string }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value.toString());
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const valueRef = useRef(value);
    const isPressingRef = useRef(false);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
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
        const newValue = increment ? value + 1 : Math.max(0, value - 1);
        onChange(newValue);
        valueRef.current = newValue;

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
            }, 80);
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

    useEffect(() => {
        if (!isEditing) {
            setInputValue(value.toString());
        }
    }, [value, isEditing]);

    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                onMouseDown={() => startIncrementing(false)}
                onMouseUp={stopIncrementing}
                onMouseLeave={stopIncrementing}
                onTouchStart={() => startIncrementing(false)}
                onTouchEnd={stopIncrementing}
                className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center font-bold pb-0.5 hover:bg-zinc-700 active:scale-95 transition-all select-none"
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
                    className="bg-zinc-800 px-2 py-2 rounded-full w-16 text-center text-xs font-bold outline-none"
                    style={{ boxShadow: `0 0 0 2px ${themeColor || '#3b82f6'}` }}
                    autoFocus
                />
            ) : (
                <div
                    onClick={() => setIsEditing(true)}
                    className="bg-zinc-800 px-3 py-2 rounded-full min-w-[3rem] text-center text-xs font-bold cursor-pointer hover:bg-zinc-700 transition-colors"
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
                className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center font-bold pb-0.5 hover:bg-zinc-700 active:scale-95 transition-all select-none"
            >
                +
            </button>
        </div>
    );
};

export const TimeCounter = ({ value, onChange, themeColor }: { value: number, onChange: (v: number) => void, themeColor?: string }) => {
    const [isEditing, setIsEditing] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const valueRef = useRef(value);
    const isPressingRef = useRef(false);

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    const formatTime = () => {
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    };

    const [inputH, setInputH] = useState(hours.toString());
    const [inputM, setInputM] = useState(minutes.toString());
    const [inputS, setInputS] = useState(seconds.toString());

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        if (!isEditing) {
            setInputH(Math.floor(value / 3600).toString());
            setInputM(Math.floor((value % 3600) / 60).toString());
            setInputS((value % 60).toString());
        }
    }, [value, isEditing]);

    useEffect(() => {
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
        const step = 5;
        const newValue = increment ? value + step : Math.max(0, value - step);
        onChange(newValue);
        valueRef.current = newValue;

        timeoutRef.current = setTimeout(() => {
            if (!isPressingRef.current) return;
            intervalRef.current = setInterval(() => {
                if (!isPressingRef.current) {
                    stopIncrementing();
                    return;
                }
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
        const totalSeconds = Math.max(0, h * 3600 + m * 60 + s);
        onChange(totalSeconds);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            setInputH(hours.toString());
            setInputM(minutes.toString());
            setInputS(seconds.toString());
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onMouseDown={() => startIncrementing(false)}
                onMouseUp={stopIncrementing}
                onMouseLeave={stopIncrementing}
                onTouchStart={() => startIncrementing(false)}
                onTouchEnd={stopIncrementing}
                className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center font-bold pb-0.5 hover:bg-zinc-700 active:scale-95 transition-all select-none"
            >
                -
            </button>
            {isEditing ? (
                <div
                    className="flex items-center gap-1 bg-zinc-800 px-2 py-1.5 rounded-full"
                    style={{ boxShadow: `0 0 0 2px ${themeColor || '#3b82f6'}` }}
                    onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            handleSave();
                        }
                    }}
                >
                    <input
                        type="text"
                        inputMode="numeric"
                        value={inputH}
                        onChange={(e) => setInputH(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent w-6 text-center text-xs font-bold outline-none"
                        placeholder="0"
                        maxLength={2}
                    />
                    <span className="text-zinc-500 text-xs">h</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={inputM}
                        onChange={(e) => setInputM(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent w-6 text-center text-xs font-bold outline-none"
                        placeholder="0"
                        maxLength={2}
                    />
                    <span className="text-zinc-500 text-xs">m</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={inputS}
                        onChange={(e) => setInputS(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent w-6 text-center text-xs font-bold outline-none"
                        placeholder="0"
                        maxLength={2}
                        autoFocus
                    />
                    <span className="text-zinc-500 text-xs">s</span>
                </div>
            ) : (
                <div
                    onClick={() => setIsEditing(true)}
                    className="bg-zinc-800 px-3 py-2 rounded-full min-w-[4rem] text-center text-xs font-bold cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                    {value === 0 ? '-' : formatTime()}
                </div>
            )}
            <button
                type="button"
                onMouseDown={() => startIncrementing(true)}
                onMouseUp={stopIncrementing}
                onMouseLeave={stopIncrementing}
                onTouchStart={() => startIncrementing(true)}
                onTouchEnd={stopIncrementing}
                className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center font-bold pb-0.5 hover:bg-zinc-700 active:scale-95 transition-all select-none"
            >
                +
            </button>
        </div>
    );
};
