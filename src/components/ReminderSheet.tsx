import { BottomSheet } from './BottomSheet';
import { ScrollClock } from './ScrollClock';
import { Button } from './Button';
import { useState, useEffect } from 'react';

interface ReminderSheetProps {
    isOpen: boolean;
    onClose: () => void;
    currentTime: string;
    onSave: (time: string) => void;
    currentFormat: '12h' | '24h';
    onFormatChange: (format: '12h' | '24h') => void;
}

export const ReminderSheet = ({ isOpen, onClose, currentTime, onSave, currentFormat, onFormatChange }: ReminderSheetProps) => {
    const [tempTime, setTempTime] = useState(currentTime || '18:30');

    // Sync tempTime when opening. 
    // Format is managed by parent (store), but we need to trigger the update there.

    useEffect(() => {
        if (isOpen) {
            setTempTime(currentTime || '18:30');
        }
    }, [isOpen, currentTime]);

    const handleSave = () => {
        onSave(tempTime);
        onClose();
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="Reminders at">
            <div className="space-y-6">

                {/* Format Toggle */}
                <div className="flex justify-center mb-4">
                    <div className="bg-zinc-900 p-1 rounded-lg flex">
                        <button
                            onClick={() => onFormatChange('12h')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${currentFormat === '12h' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
                        >
                            12h
                        </button>
                        <button
                            onClick={() => onFormatChange('24h')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${currentFormat === '24h' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
                        >
                            24h
                        </button>
                    </div>
                </div>

                <ScrollClock
                    initialTime={currentTime} // ScrollClock expects the raw 24h time to init
                    // But wait, if we change tempTime via scrolling, we should probably pass tempTime back in?
                    // Actually ScrollClock initializes its own state from initialTime prop ONCE by default logic (useState).
                    // But we modified ScrollClock in previous step to NOT re-init unless we force it? 
                    // No, previous ScrollClock logic was:
                    // useEffect(() => { ... }, [format]) -> re-calculates scrollTop based on internal state.
                    // It does NOT re-read initialTime prop if it changes.
                    // BUT RemindeSheet unmounts/remounts ScrollClock if BottomSheet unmounts it?
                    // Yes, BottomSheet unmounts children.
                    // So initialTime={currentTime} is fine on FIRST open.
                    // But while open, if we toggle format... ScrollClock is still mounted.
                    // ScrollClock handles format change via useEffect.

                    onChange={setTempTime}
                    format={currentFormat}
                />

                <Button variant="primary" fullWidth onClick={handleSave} className="bg-white text-black hover:bg-gray-200 mt-4">
                    Save
                </Button>
            </div>
        </BottomSheet>
    );
};
