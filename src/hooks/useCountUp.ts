import { useEffect, useState } from 'react';

/** Animates from 0 to `target` with an ease-out curve. Returns the current value. */
export function useCountUp(target: number, durationMs: number = 800): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame: number;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(progress < 1 ? Math.floor(eased * target) : target);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
