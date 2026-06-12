import { useState } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { ScrollClock } from '../ui/ScrollClock';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { DEFAULT_REMINDER_TIME } from '../../constants';
import type { TimeFormat } from '../../db/db';

interface ReminderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Current reminder in 24h "HH:MM". */
  currentTime: string;
  onSave: (time: string) => void;
  currentFormat: TimeFormat;
  onFormatChange: (format: TimeFormat) => void;
}

interface ReminderPickerProps {
  initialTime: string;
  format: TimeFormat;
  onFormatChange: (format: TimeFormat) => void;
  onSave: (time: string) => void;
}

/**
 * Picker body, mounted fresh each time the sheet opens so the pending
 * selection always starts from the saved time.
 */
const ReminderPicker = ({ initialTime, format, onFormatChange, onSave }: ReminderPickerProps) => {
  const [pendingTime, setPendingTime] = useState(initialTime || DEFAULT_REMINDER_TIME);

  const formatButton = (value: TimeFormat) => (
    <button
      onClick={() => onFormatChange(value)}
      className={cn(
        'rounded-md px-4 py-1.5 text-sm font-bold transition-colors',
        format === value ? 'bg-zinc-700 text-white' : 'text-zinc-500',
      )}
    >
      {value}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="mb-4 flex justify-center">
        <div className="flex rounded-lg bg-zinc-900 p-1">
          {formatButton('12h')}
          {formatButton('24h')}
        </div>
      </div>

      <ScrollClock initialTime={initialTime} onChange={setPendingTime} format={format} />

      <Button
        variant="primary"
        fullWidth
        onClick={() => onSave(pendingTime)}
        className="mt-4 bg-white text-black hover:bg-gray-200"
      >
        Save
      </Button>
    </div>
  );
};

/** Time picker for workout reminders, with a 12h/24h display toggle. */
export const ReminderSheet = ({
  isOpen,
  onClose,
  currentTime,
  onSave,
  currentFormat,
  onFormatChange,
}: ReminderSheetProps) => (
  <BottomSheet isOpen={isOpen} onClose={onClose} title="Reminders at">
    <ReminderPicker
      initialTime={currentTime}
      format={currentFormat}
      onFormatChange={onFormatChange}
      onSave={(time) => {
        onSave(time);
        onClose();
      }}
    />
  </BottomSheet>
);
