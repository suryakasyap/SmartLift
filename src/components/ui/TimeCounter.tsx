import { useState } from 'react';
import { formatDurationLabel } from '../../lib/datetime';
import { useHoldRepeat, type StepDirection } from '../../hooks/useHoldRepeat';
import { StepButton } from './StepButton';

const STEP_SECONDS = 5;

interface TimeCounterProps {
  /** Duration in seconds. */
  value: number;
  onChange: (value: number) => void;
  /** Focus ring colour while typing a value directly. */
  accentColor?: string;
}

interface TimeFieldProps {
  value: string;
  label: 'h' | 'm' | 's';
  onChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  autoFocus?: boolean;
}

const TimeField = ({ value, label, onChange, onKeyDown, autoFocus }: TimeFieldProps) => (
  <>
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      className="w-6 bg-transparent text-center text-xs font-bold outline-none"
      placeholder="0"
      maxLength={2}
      autoFocus={autoFocus}
    />
    <span className="text-xs text-zinc-500">{label}</span>
  </>
);

/** Duration stepper (h/m/s) with press-and-hold buttons and tap-to-type editing. */
export const TimeCounter = ({ value, onChange, accentColor }: TimeCounterProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputHours, setInputHours] = useState('0');
  const [inputMinutes, setInputMinutes] = useState('0');
  const [inputSeconds, setInputSeconds] = useState('0');

  const { start, stop } = useHoldRepeat((direction: StepDirection) => {
    onChange(Math.max(0, value + direction * STEP_SECONDS));
  });

  const beginEditing = () => {
    setInputHours(Math.floor(value / 3600).toString());
    setInputMinutes(Math.floor((value % 3600) / 60).toString());
    setInputSeconds((value % 60).toString());
    setIsEditing(true);
  };

  const commitInput = () => {
    const hours = parseInt(inputHours, 10) || 0;
    const minutes = parseInt(inputMinutes, 10) || 0;
    const seconds = parseInt(inputSeconds, 10) || 0;
    onChange(Math.max(0, hours * 3600 + minutes * 60 + seconds));
    setIsEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') commitInput();
    if (event.key === 'Escape') setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2">
      <StepButton direction={-1} onStart={start} onStop={stop} />

      {isEditing ? (
        <div
          className="flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-1.5 text-white"
          style={{ boxShadow: `0 0 0 2px ${accentColor ?? 'var(--accent)'}` }}
          onBlur={(event) => {
            // Commit only when focus leaves the whole h/m/s group.
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              commitInput();
            }
          }}
        >
          <TimeField value={inputHours} label="h" onChange={setInputHours} onKeyDown={handleKeyDown} />
          <TimeField value={inputMinutes} label="m" onChange={setInputMinutes} onKeyDown={handleKeyDown} />
          <TimeField value={inputSeconds} label="s" onChange={setInputSeconds} onKeyDown={handleKeyDown} autoFocus />
        </div>
      ) : (
        <div
          onClick={beginEditing}
          className="min-w-[4rem] cursor-pointer rounded-full bg-zinc-800 px-3 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-zinc-700"
        >
          {value === 0 ? '-' : formatDurationLabel(value)}
        </div>
      )}

      <StepButton direction={1} onStart={start} onStop={stop} />
    </div>
  );
};
