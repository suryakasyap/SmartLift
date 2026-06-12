import type { TimeFormat } from '../db/db';

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Formats a 24h "HH:MM" string for display, e.g. "18:30" or "6:30 PM". */
export function formatClockTime(time24: string, format: TimeFormat): string {
  if (!time24) return '--:--';
  if (format === '24h') return time24;

  const [hours, minutes] = time24.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time24;

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}

/** Converts a duration in seconds to "HH:MM:SS". */
export function secondsToHms(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((part) => part.toString().padStart(2, '0'))
    .join(':');
}

/** Parses an "HH:MM:SS" string into seconds. Missing or invalid parts count as zero. */
export function hmsToSeconds(hms: string): number {
  const [hours, minutes, seconds] = hms.split(':').map(Number);
  return (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
}

/** Formats a rest duration as "M:SS", e.g. 180 -> "3:00". */
export function formatRestTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Formats a duration as a compact label, e.g. "1h 5m 30s", "5m 30s" or "30s". */
export function formatDurationLabel(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
