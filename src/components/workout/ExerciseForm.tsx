import { useMemo, useState } from 'react';
import {
  Palette,
  Repeat,
  Target,
  Weight,
  Activity,
  Dumbbell,
  Home as HomeIcon,
  Hourglass,
  Timer,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { Counter } from '../ui/Counter';
import { TimeCounter } from '../ui/TimeCounter';
import { ColorPicker } from '../ui/ColorPicker';
import { MuscleGroupSheet } from './MuscleGroupSheet';
import { EquipmentSelectSheet } from './EquipmentSelectSheet';
import { useThemeStore } from '../../store/themeStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { DEFAULT_TARGET_TIME_SECONDS, EQUIPMENT_OPTIONS } from '../../constants';
import type { Exercise, RepType } from '../../db/db';

const DEFAULT_EQUIPMENT = 'Bodyweight';
const DEFAULT_MUSCLE_GROUP = 'General';

// Draft exercises get negative temporary ids (so they can never collide with
// real auto-increment ids); the database assigns the real id on save.
let nextDraftId = -1;
const createDraftId = () => nextDraftId--;

const toggleListItem = (list: string[], item: string) =>
  list.includes(item) ? list.filter((existing) => existing !== item) : [...list, item];

interface ExerciseFormProps {
  /** Exercise to pre-fill when editing; omit for a blank form. */
  initial?: Exercise | null;
  submitLabel: string;
  onSubmit: (exercise: Exercise) => void;
}

const FieldRow = ({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Palette;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-zinc-500" />
      <span className="font-bold text-white">{label}</span>
    </div>
    {children}
  </div>
);

const Divider = () => <div className="h-px bg-zinc-800" />;

/**
 * Exercise editor used by both the bottom-sheet and full-page flows.
 * Owns its own field state; the parent decides what to do on submit.
 */
export const ExerciseForm = ({ initial, submitLabel, onSubmit }: ExerciseFormProps) => {
  const { appColor } = useThemeStore();
  const ownedEquipmentIds = useEquipmentStore((state) => state.selectedEquipment);

  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? appColor);
  const [repType, setRepType] = useState<RepType>(initial?.rep_type ?? 'reps');
  const [targetReps, setTargetReps] = useState(initial?.target_reps ?? 0);
  const [targetWeight, setTargetWeight] = useState(initial?.target_weight ?? 0);
  const [targetTime, setTargetTime] = useState(
    initial?.target_time ?? DEFAULT_TARGET_TIME_SECONDS,
  );
  const [targetSets, setTargetSets] = useState(initial?.target_sets ?? 3);
  const [muscleGroups, setMuscleGroups] = useState<string[]>(
    initial?.muscle_group ? initial.muscle_group.split(', ') : [],
  );
  const [equipment, setEquipment] = useState<string[]>(
    initial?.equipment ? initial.equipment.split(', ') : [DEFAULT_EQUIPMENT],
  );
  const [isHome, setIsHome] = useState(initial?.is_home ?? false);

  const [isMuscleGroupOpen, setIsMuscleGroupOpen] = useState(false);
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);

  const ownedEquipmentNames = useMemo(
    () =>
      EQUIPMENT_OPTIONS.filter((option) => ownedEquipmentIds.includes(option.id)).map(
        (option) => option.name,
      ),
    [ownedEquipmentIds],
  );

  // Ignore selections for equipment the user no longer owns.
  const availableEquipment = equipment.filter((name) => ownedEquipmentNames.includes(name));

  const handleSubmit = () => {
    if (!name) return;

    onSubmit({
      id: initial?.id ?? createDraftId(),
      workoutId: initial?.workoutId ?? 0,
      name,
      color,
      rep_type: repType,
      target_reps: targetReps,
      target_weight: targetWeight,
      target_time: targetTime,
      target_sets: targetSets,
      muscle_group: muscleGroups.length > 0 ? muscleGroups.join(', ') : DEFAULT_MUSCLE_GROUP,
      equipment:
        availableEquipment.length > 0 ? availableEquipment.join(', ') : DEFAULT_EQUIPMENT,
      is_home: isHome,
    });
  };

  const selectionLabel = (selected: string[], maxInline: number) => {
    if (selected.length === 0) return 'Select';
    if (selected.length > maxInline) return `${selected.length} selected`;
    return selected.join(', ');
  };

  return (
    <>
      <input
        type="text"
        placeholder="Exercise name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="mb-6 w-full bg-transparent text-3xl font-bold caret-white outline-none placeholder:text-zinc-700"
        style={{ color: name ? color : '#ffffff' }}
      />

      <div className="space-y-4">
        <FieldRow icon={Palette} label="Color">
          <ColorPicker value={color} onChange={setColor} />
        </FieldRow>

        <Divider />

        <FieldRow icon={Repeat} label="Rep Type">
          <button
            onClick={() => setRepType(repType === 'reps' ? 'time' : 'reps')}
            className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-700"
          >
            {repType === 'reps' ? <Repeat className="h-3 w-3" /> : <Hourglass className="h-3 w-3" />}
            {repType}
          </button>
        </FieldRow>

        {repType === 'reps' ? (
          <>
            <Divider />
            <FieldRow icon={Target} label="Rep target">
              <Counter value={targetReps} onChange={setTargetReps} accentColor={color} />
            </FieldRow>
            <FieldRow icon={Weight} label="Weight target">
              <Counter value={targetWeight} onChange={setTargetWeight} unit="kg" accentColor={color} />
            </FieldRow>
          </>
        ) : (
          <>
            <Divider />
            <FieldRow icon={Timer} label="Rep time">
              <TimeCounter value={targetTime} onChange={setTargetTime} accentColor={color} />
            </FieldRow>
            <FieldRow icon={Layers} label="Target sets">
              <Counter value={targetSets} onChange={setTargetSets} accentColor={color} />
            </FieldRow>
          </>
        )}

        <FieldRow icon={Activity} label="Muscle group">
          <button
            onClick={() => setIsMuscleGroupOpen(true)}
            className="min-w-[3rem] max-w-[150px] truncate rounded-full bg-zinc-800 px-4 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-zinc-700"
          >
            {selectionLabel(muscleGroups, 2)}
          </button>
        </FieldRow>

        <Divider />

        <FieldRow icon={Dumbbell} label="Equipment">
          <button
            onClick={() => setIsEquipmentOpen(true)}
            className="min-w-[3rem] max-w-[150px] truncate rounded-full bg-zinc-800 px-4 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-zinc-700"
          >
            {selectionLabel(availableEquipment, 1)}
          </button>
        </FieldRow>

        <Divider />

        <FieldRow icon={HomeIcon} label="Add to Home">
          <Toggle checked={isHome} onCheckedChange={setIsHome} />
        </FieldRow>
      </div>

      <Button
        fullWidth
        className="mt-8 rounded-2xl bg-accent py-4 font-bold text-white shadow-lg transition-all"
        onClick={handleSubmit}
        disabled={!name}
      >
        {submitLabel}
      </Button>

      <MuscleGroupSheet
        isOpen={isMuscleGroupOpen}
        onClose={() => setIsMuscleGroupOpen(false)}
        selectedGroups={muscleGroups}
        onToggle={(group) => setMuscleGroups((current) => toggleListItem(current, group))}
      />

      <EquipmentSelectSheet
        isOpen={isEquipmentOpen}
        onClose={() => setIsEquipmentOpen(false)}
        selectedEquipment={availableEquipment}
        onToggle={(item) => setEquipment(toggleListItem(availableEquipment, item))}
      />
    </>
  );
};
