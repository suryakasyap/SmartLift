import { useState } from 'react';
import { useHoldRepeat, type StepDirection } from '../../hooks/useHoldRepeat';
import { StepButton } from './StepButton';

interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  /** Focus ring colour while typing a value directly. */
  accentColor?: string;
}

/** Numeric stepper with press-and-hold buttons and tap-to-type editing. */
export const Counter = ({ value, onChange, unit, accentColor }: CounterProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  const { start, stop } = useHoldRepeat((direction: StepDirection) => {
    onChange(Math.max(0, value + direction));
  });

  const beginEditing = () => {
    setInputValue(value.toString());
    setIsEditing(true);
  };

  const commitInput = () => {
    const parsed = parseInt(inputValue, 10);
    onChange(Number.isNaN(parsed) ? 0 : Math.max(0, parsed));
    setIsEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') commitInput();
    if (event.key === 'Escape') {
      setIsEditing(false);
      setInputValue(value.toString());
    }
  };

  return (
    <div className="flex items-center gap-2">
      <StepButton direction={-1} onStart={start} onStop={stop} />

      {isEditing ? (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onBlur={commitInput}
          onKeyDown={handleKeyDown}
          className="w-16 rounded-full bg-zinc-800 px-2 py-2 text-center text-xs font-bold text-white outline-none"
          style={{ boxShadow: `0 0 0 2px ${accentColor ?? 'var(--accent)'}` }}
          autoFocus
        />
      ) : (
        <div
          onClick={beginEditing}
          className="min-w-[3rem] cursor-pointer rounded-full bg-zinc-800 px-3 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-zinc-700"
        >
          {value === 0 ? '-' : value} {unit}
        </div>
      )}

      <StepButton direction={1} onStart={start} onStop={stop} />
    </div>
  );
};
