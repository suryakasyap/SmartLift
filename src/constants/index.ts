export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

/** Single-letter labels for a Monday-first week. */
export const WEEK_DAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const DEFAULT_ACCENT_COLOR = '#f97316';
export const DEFAULT_REMINDER_TIME = '18:30';
export const DEFAULT_REST_SECONDS = 180;
export const DEFAULT_CYCLE_COUNT = 3;
export const DEFAULT_TARGET_TIME_SECONDS = 30;

export const PRESET_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#FF63E9', // pink
  '#f97316', // orange
  '#C19A6B', // tan
] as const;

export interface MuscleGroupSection {
  category: string;
  items: string[];
}

export const MUSCLE_GROUPS: MuscleGroupSection[] = [
  {
    category: 'Upper Body',
    items: ['Chest', 'Back', 'Shoulders', 'Arms', 'Forearms'],
  },
  {
    category: 'Lower Body',
    items: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
  },
  {
    category: 'Core',
    items: ['Abs', 'Obliques', 'Lower Back'],
  },
];

export interface EquipmentOption {
  id: string;
  name: string;
}

export const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  { id: 'bodyweight', name: 'Bodyweight' },
  { id: 'machines', name: 'Machines' },
  { id: 'barbells', name: 'Barbells' },
  { id: 'dumbbell', name: 'Dumbbell' },
  { id: 'cable', name: 'Cable' },
  { id: 'kettlebell', name: 'Kettlebell' },
  { id: 'suspension', name: 'Suspension' },
  { id: 'resistance_band', name: 'Resistance Band' },
  { id: 'medicine_ball', name: 'Medicine Ball' },
  { id: 'roller', name: 'Roller' },
  { id: 'bosu_ball', name: 'Bosu Ball' },
  { id: 'stability_ball', name: 'Stability Ball' },
  { id: 'rope', name: 'Rope' },
  { id: 'stick', name: 'Stick' },
  { id: 'cardio', name: 'Cardio' },
  { id: 'other', name: 'Other' },
];
