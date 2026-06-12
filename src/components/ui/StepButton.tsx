import type { StepDirection } from '../../hooks/useHoldRepeat';

interface StepButtonProps {
  direction: StepDirection;
  onStart: (direction: StepDirection) => void;
  onStop: () => void;
}

/** Round +/- button with press-and-hold support, used by the counter inputs. */
export const StepButton = ({ direction, onStart, onStop }: StepButtonProps) => (
  <button
    type="button"
    aria-label={direction === 1 ? 'Increase' : 'Decrease'}
    onMouseDown={() => onStart(direction)}
    onMouseUp={onStop}
    onMouseLeave={onStop}
    onTouchStart={() => onStart(direction)}
    onTouchEnd={onStop}
    className="flex h-8 w-8 select-none items-center justify-center rounded-full bg-zinc-800 pb-0.5 font-bold text-white transition-all hover:bg-zinc-700 active:scale-95"
  >
    {direction === 1 ? '+' : '-'}
  </button>
);
