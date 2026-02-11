import { useState } from 'react';
import { cn } from '../lib/utils';

// Color Picker Component
interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
}

const COLORS = [
    '#3b82f6', // Blue
    '#22c55e', // Green
    '#FF63E9', // Candy Pink (Hot Pink/Magentaish)
    '#f97316', // Orange
    '#C19A6B', // Lion
];

// Minimal Color Indicator (Dropdown or Modal trigger in future? For now, simple color picker popover or just inline)
export const ColorIndicator = ({ value, onClick }: { value: string, onClick?: () => void }) => {
    return (
        <div
            onClick={onClick}
            className="w-6 h-6 rounded-full border border-zinc-700 cursor-pointer"
            style={{ backgroundColor: value }}
        />
    );
};

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {

    return (
        <div className="flex gap-2 justify-end">
            {COLORS.slice(0, 5).map(color => (
                <button
                    key={color}
                    onClick={() => onChange(color)}
                    className={cn(
                        "w-6 h-6 rounded-full transition-all border-2",
                        value === color ? "border-white scale-110" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                    style={{ backgroundColor: color }}
                />
            ))}
            <div className="relative">
                <button
                    className={cn(
                        "w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border transition-all",
                        // If value is not in presets, assume it's custom and highlight this button
                        !COLORS.includes(value) ? "border-white scale-110" : "border-zinc-700 opacity-70 hover:opacity-100"
                    )}
                >
                    <div
                        className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500 opacity-80"
                        style={{ background: !COLORS.includes(value) ? value : undefined }}
                    />
                </button>
                <input
                    type="color"
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
};

// Sets Input Component
interface SetsInputProps {
    value: string;
    onChange: (val: string) => void;
}

export const SetsInput = ({ value, onChange }: SetsInputProps) => {
    const [inputValue, setInputValue] = useState(value);

    const handleBlur = () => {
        onChange(inputValue);
    };

    return (
        <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g. 30-30-30"
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-right w-28 focus:outline-none focus:border-zinc-600 font-mono"
        />
    );
};

// Rep Type Toggle
interface RepTypeToggleProps {
    value: 'reps' | 'time';
    onChange: (val: 'reps' | 'time') => void;
    activeColor?: string;
}

import { useThemeStore } from '../store/themeStore';

export const RepTypeToggle = ({ value, onChange, activeColor }: RepTypeToggleProps) => {
    const { appColor } = useThemeStore();
    const activeStyle = { backgroundColor: activeColor || appColor, color: 'white' };

    return (
        <div className="flex bg-zinc-900 rounded-lg p-1">
            <button
                onClick={() => onChange('reps')}
                className={cn(
                    "px-3 py-1 text-xs font-bold rounded-md transition-colors",
                    value !== 'reps' && "text-zinc-500 hover:text-zinc-300"
                )}
                style={value === 'reps' ? activeStyle : undefined}
            >
                Reps
            </button>
            <button
                onClick={() => onChange('time')}
                className={cn(
                    "px-3 py-1 text-xs font-bold rounded-md transition-colors",
                    value !== 'time' && "text-zinc-500 hover:text-zinc-300"
                )}
                style={value === 'time' ? activeStyle : undefined}
            >
                Time
            </button>
        </div>
    );
};
