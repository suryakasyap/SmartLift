import { useEffect, useRef, useState } from 'react';
import type { TimeFormat } from '../../db/db';

const ITEM_HEIGHT = 48;
/** Hour/minute lists are repeated to fake an infinite wheel. */
const LOOP_COUNT = 20;
const MERIDIEMS = ['AM', 'PM'] as const;

const BASE_HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
const BASE_HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const BASE_MINUTES = Array.from({ length: 60 }, (_, i) => i);

const loop = (values: number[]) => Array<number[]>(LOOP_COUNT).fill(values).flat();

/** Index of `value` in the middle repetition, so there is room to scroll both ways. */
const middleIndex = (value: number, baseLength: number) =>
  Math.floor(LOOP_COUNT / 2) * baseLength + value;

interface ScrollClockProps {
  /** Initial time as 24h "HH:MM". */
  initialTime: string;
  /** Called with the selected time, always in 24h "HH:MM". */
  onChange: (time: string) => void;
  format: TimeFormat;
}

interface WheelColumnProps {
  columnRef: React.RefObject<HTMLDivElement | null>;
  values: readonly (number | string)[];
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  className?: string;
  itemClassName?: string;
}

const WheelColumn = ({ columnRef, values, onScroll, className, itemClassName }: WheelColumnProps) => (
  <div
    ref={columnRef}
    className={`scrollbar-hide h-full snap-y snap-mandatory overflow-y-scroll py-[72px] ${className ?? ''}`}
    onScroll={onScroll}
  >
    {values.map((value, index) => (
      <div
        key={index}
        className={`flex h-12 w-16 snap-center items-center justify-center ${itemClassName ?? ''}`}
      >
        {typeof value === 'number' ? value.toString().padStart(2, '0') : value}
      </div>
    ))}
  </div>
);

export const ScrollClock = ({ initialTime, onChange, format }: ScrollClockProps) => {
  const [initialHours, initialMinutes] = initialTime.split(':').map(Number);

  // Time is always tracked in 24h form; 12h is purely a display concern.
  const [hour24, setHour24] = useState(Number.isNaN(initialHours) ? 18 : initialHours);
  const [minute, setMinute] = useState(Number.isNaN(initialMinutes) ? 30 : initialMinutes);
  const [meridiem, setMeridiem] = useState<'AM' | 'PM'>(hour24 >= 12 ? 'PM' : 'AM');

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const meridiemRef = useRef<HTMLDivElement>(null);

  // Position the wheels on mount and whenever the format changes. The small
  // delay lets the parent sheet finish its open animation/layout first.
  useEffect(() => {
    const sync = () => {
      if (hourRef.current) {
        const index =
          format === '24h'
            ? middleIndex(hour24, 24)
            : middleIndex(BASE_HOURS_12.indexOf(hour24 % 12 || 12), 12);
        hourRef.current.scrollTop = index * ITEM_HEIGHT;
      }
      if (meridiemRef.current) {
        meridiemRef.current.scrollTop = (hour24 >= 12 ? 1 : 0) * ITEM_HEIGHT;
      }
      if (minuteRef.current) {
        minuteRef.current.scrollTop = middleIndex(minute, 60) * ITEM_HEIGHT;
      }
    };

    const timer = setTimeout(sync, 50);
    return () => clearTimeout(timer);
    // Re-sync only on format switches; current values are read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format]);

  const emitTime = (hours: number, minutes: number) => {
    const safeHours = Math.max(0, Math.min(23, hours));
    const safeMinutes = Math.max(0, Math.min(59, minutes));
    onChange(
      `${safeHours.toString().padStart(2, '0')}:${safeMinutes.toString().padStart(2, '0')}`,
    );
  };

  const scrolledIndex = (event: React.UIEvent<HTMLDivElement>) =>
    Math.round(event.currentTarget.scrollTop / ITEM_HEIGHT);

  const handleHourScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const index = scrolledIndex(event);
    let nextHour24: number;

    if (format === '24h') {
      nextHour24 = index % 24;
    } else {
      const hour12 = BASE_HOURS_12[index % 12];
      nextHour24 = hour12 % 12;
      if (meridiem === 'PM') nextHour24 += 12;
    }

    if (nextHour24 !== hour24) {
      setHour24(nextHour24);
      emitTime(nextHour24, minute);
    }
  };

  const handleMinuteScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const nextMinute = scrolledIndex(event) % 60;
    if (nextMinute !== minute) {
      setMinute(nextMinute);
      emitTime(hour24, nextMinute);
    }
  };

  const handleMeridiemScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const index = Math.max(0, Math.min(1, scrolledIndex(event)));
    const nextMeridiem = MERIDIEMS[index];
    if (nextMeridiem === meridiem) return;

    setMeridiem(nextMeridiem);
    const nextHour24 =
      nextMeridiem === 'PM' && hour24 < 12
        ? hour24 + 12
        : nextMeridiem === 'AM' && hour24 >= 12
          ? hour24 - 12
          : hour24;
    setHour24(nextHour24);
    emitTime(nextHour24, minute);
  };

  return (
    <div className="relative flex h-48 w-full select-none justify-center text-white">
      <div className="pointer-events-none absolute top-1/2 h-12 w-full -translate-y-1/2 rounded-lg bg-zinc-800/50" />

      <div className="z-10 flex gap-8 font-mono text-3xl font-bold">
        <WheelColumn
          columnRef={hourRef}
          values={format === '24h' ? loop(BASE_HOURS_24) : loop(BASE_HOURS_12)}
          onScroll={handleHourScroll}
        />

        <div className="flex items-center pb-2">:</div>

        <WheelColumn
          columnRef={minuteRef}
          values={loop(BASE_MINUTES)}
          onScroll={handleMinuteScroll}
        />

        {format === '12h' && (
          <WheelColumn
            columnRef={meridiemRef}
            values={MERIDIEMS}
            onScroll={handleMeridiemScroll}
            className="ml-4 border-l border-zinc-800 pl-4"
            itemClassName="text-xl text-zinc-400"
          />
        )}
      </div>
    </div>
  );
};
