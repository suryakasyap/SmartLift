import { useState } from 'react';
import { Calendar, Clock, Repeat, Dumbbell, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { PlanningSheet } from './PlanningSheet';
import { ReminderSheet } from './ReminderSheet';
import { useWorkoutStore } from '../../store/workoutStore';
import { formatClockTime } from '../../lib/datetime';
import { DEFAULT_REMINDER_TIME, WEEK_DAYS, WEEK_DAY_INITIALS } from '../../constants';
import type { Exercise } from '../../db/db';

interface WorkoutFormFieldsProps {
  onAddExercise: () => void;
  onEditExercise: (exercise: Exercise) => void;
}

/** Mini week overview shown next to the Planning row. */
const PlanningSummary = () => {
  const { isPlanned, planningType, selectedDays, spacingDays, color } = useWorkoutStore();

  if (!isPlanned) {
    return <span className="text-sm font-medium text-zinc-600">None</span>;
  }

  if (planningType === 'spacing') {
    return <span className="font-mono text-sm text-zinc-400">Every {spacingDays} days</span>;
  }

  return (
    <div className="flex gap-1">
      {WEEK_DAYS.map((day, index) => {
        const isSelected = selectedDays.includes(day);
        return (
          <div key={day} className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-bold text-zinc-600">
              {WEEK_DAY_INITIALS[index]}
            </span>
            <div
              className="h-1.5 w-1.5 rounded-full bg-zinc-800"
              style={isSelected ? { backgroundColor: color } : undefined}
            />
          </div>
        );
      })}
    </div>
  );
};

const DraftExerciseItem = ({
  exercise,
  onEdit,
  onRemove,
}: {
  exercise: Exercise;
  onEdit: () => void;
  onRemove: () => void;
}) => (
  <div className="flex items-center justify-between rounded-xl bg-zinc-800/50 p-3">
    <div>
      <h3 className="text-sm font-bold" style={{ color: exercise.color ?? '#ffffff' }}>
        {exercise.name}
      </h3>
      <p className="text-xs text-zinc-500">
        {exercise.rep_type === 'time' ? 'Time based' : `${exercise.target_reps} reps`} •{' '}
        {exercise.target_weight}kg
      </p>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={onEdit}
        title="Edit exercise"
        className="p-1.5 text-zinc-400 transition-colors hover:text-white"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={onRemove}
        title="Delete exercise"
        className="p-1.5 text-zinc-400 transition-colors hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const RowLabel = ({ icon: Icon, label }: { icon: typeof Calendar; label: string }) => (
  <div className="flex items-center gap-3">
    <Icon className="h-5 w-5 text-zinc-500" />
    <span className="font-bold text-white">{label}</span>
  </div>
);

/**
 * The shared body of the workout form (planning, reminders, exercises and
 * cycling), bound to the workout draft store. Used by both the bottom-sheet
 * and full-page creation flows.
 */
export const WorkoutFormFields = ({ onAddExercise, onEditExercise }: WorkoutFormFieldsProps) => {
  const {
    isPlanned,
    planningType,
    selectedDays,
    spacingDays,
    reminderEnabled,
    reminderTime,
    timeFormat,
    cycleEnabled,
    cycleCount,
    color,
    exercises,
    updateDraft,
    removeExercise,
  } = useWorkoutStore();

  const [isPlanningOpen, setIsPlanningOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  const handleReminderToggle = (enabled: boolean) => {
    // First activation defaults the reminder to the current time of day.
    if (enabled && reminderTime === DEFAULT_REMINDER_TIME) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      updateDraft({ reminderEnabled: enabled, reminderTime: `${hours}:${minutes}` });
      return;
    }
    updateDraft({ reminderEnabled: enabled });
  };

  return (
    <>
      <div className="space-y-0 divide-y divide-zinc-800">
        <div
          onClick={() => setIsPlanningOpen(true)}
          className="flex cursor-pointer items-center justify-between py-4"
        >
          <RowLabel icon={Calendar} label="Planning" />
          <PlanningSummary />
        </div>

        <div className="flex items-center justify-between py-4">
          <RowLabel icon={Clock} label="Reminders" />
          <Toggle
            checked={reminderEnabled}
            onCheckedChange={handleReminderToggle}
            activeColor={color}
          />
        </div>

        {reminderEnabled && (
          <div
            onClick={() => setIsReminderOpen(true)}
            className="flex cursor-pointer items-center justify-between py-4 pl-8"
          >
            <span className="font-medium text-zinc-500">Time</span>
            <div className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-bold text-white">
              {formatClockTime(reminderTime, timeFormat)}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <RowLabel icon={Dumbbell} label="Exercises" />
            {exercises.length > 0 && (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                {exercises.length}
              </span>
            )}
          </div>
          <Button
            variant="secondary"
            className="rounded-full bg-zinc-800 px-3 py-1.5 text-xs font-bold transition-colors hover:bg-zinc-700"
            onClick={onAddExercise}
          >
            + add exercise
          </Button>
        </div>

        {exercises.length > 0 && (
          <div className="space-y-2 py-4">
            {exercises.map((exercise) => (
              <DraftExerciseItem
                key={exercise.id}
                exercise={exercise}
                onEdit={() => onEditExercise(exercise)}
                onRemove={() => removeExercise(exercise.id)}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between py-4">
          <RowLabel icon={Repeat} label="Cycle this workout" />
          <div className="flex items-center gap-4">
            {cycleEnabled && (
              <div className="flex items-center rounded-lg bg-zinc-800 p-1">
                <button
                  onClick={() => updateDraft({ cycleCount: Math.max(1, cycleCount - 1) })}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
                >
                  -
                </button>
                <span className="w-6 text-center font-mono text-sm font-bold text-white">
                  {cycleCount}
                </span>
                <button
                  onClick={() => updateDraft({ cycleCount: cycleCount + 1 })}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
                >
                  +
                </button>
              </div>
            )}
            <Toggle
              checked={cycleEnabled}
              onCheckedChange={(cycleEnabled) => updateDraft({ cycleEnabled })}
              activeColor={color}
            />
          </div>
        </div>
      </div>

      <PlanningSheet
        isOpen={isPlanningOpen}
        onClose={() => setIsPlanningOpen(false)}
        isPlanned={isPlanned}
        setIsPlanned={(isPlanned) => updateDraft({ isPlanned })}
        planningType={planningType}
        setPlanningType={(planningType) => updateDraft({ planningType })}
        selectedDays={selectedDays}
        setSelectedDays={(selectedDays) => updateDraft({ selectedDays })}
        spacingDays={spacingDays}
        setSpacingDays={(spacingDays) => updateDraft({ spacingDays })}
      />

      <ReminderSheet
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        currentTime={reminderTime}
        onSave={(reminderTime) => updateDraft({ reminderTime })}
        currentFormat={timeFormat}
        onFormatChange={(timeFormat) => updateDraft({ timeFormat })}
      />
    </>
  );
};
