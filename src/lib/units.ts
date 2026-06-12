import type { UnitSystem } from '../db/db';

const LBS_PER_KG = 2.20462;

/**
 * Converts a weight between unit systems. Logs created before unit snapshots
 * existed have no `from` unit and are treated as metric.
 */
export function convertWeight(
  value: number,
  from: UnitSystem | undefined,
  to: UnitSystem,
): number {
  const source = from ?? 'Metrics';
  if (source === to) return value;
  return source === 'Metrics' ? value * LBS_PER_KG : value / LBS_PER_KG;
}

export function weightUnitLabel(units: UnitSystem): string {
  return units === 'Imperial' ? 'lbs' : 'kg';
}
