import { useEffect, useRef } from 'react';

const HOLD_DELAY_MS = 300;
const REPEAT_INTERVAL_MS = 80;

export type StepDirection = 1 | -1;

/**
 * Press-and-hold stepper behaviour: fires `onStep` once immediately, then
 * repeatedly while the pointer stays down. Call `start` on pointer down and
 * `stop` on pointer up/leave; pending timers are cleared on unmount.
 */
export function useHoldRepeat(onStep: (direction: StepDirection) => void) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep the latest callback so repeated steps always see fresh state.
  const onStepRef = useRef(onStep);
  useEffect(() => {
    onStepRef.current = onStep;
  });

  const stop = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = (direction: StepDirection) => {
    onStepRef.current(direction);
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(
        () => onStepRef.current(direction),
        REPEAT_INTERVAL_MS,
      );
    }, HOLD_DELAY_MS);
  };

  useEffect(() => stop, []);

  return { start, stop };
}
