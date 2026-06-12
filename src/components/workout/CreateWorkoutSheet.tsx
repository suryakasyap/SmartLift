import { useEffect } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { WorkoutFormFields } from './WorkoutFormFields';
import { useWorkoutStore } from '../../store/workoutStore';
import { useThemeStore } from '../../store/themeStore';
import { saveWorkout } from '../../lib/workouts';
import type { Exercise } from '../../db/db';

interface CreateWorkoutSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onExerciseAdd?: () => void;
  onExerciseEdit?: (exercise: Exercise) => void;
}

/** Quick workout creation flow, opened from the bottom navigation. */
export const CreateWorkoutSheet = ({
  isOpen,
  onClose,
  onExerciseAdd,
  onExerciseEdit,
}: CreateWorkoutSheetProps) => {
  const { name, color, exercises, editingId, updateDraft, reset } = useWorkoutStore();
  const { appColor } = useThemeStore();

  // New drafts start from the user's theme colour.
  useEffect(() => {
    if (isOpen) updateDraft({ color: appColor });
  }, [isOpen, appColor, updateDraft]);

  const handleCreate = async () => {
    if (!name) return;
    await saveWorkout(useWorkoutStore.getState(), exercises, editingId);
    reset();
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="New workout">
      <input
        type="text"
        placeholder="Workout name"
        value={name}
        onChange={(event) => updateDraft({ name: event.target.value })}
        className="mb-6 w-full bg-transparent text-3xl font-bold text-white caret-white outline-none placeholder:text-zinc-700"
      />

      <WorkoutFormFields
        onAddExercise={() => onExerciseAdd?.()}
        onEditExercise={(exercise) => onExerciseEdit?.(exercise)}
      />

      <Button
        fullWidth
        className="mt-8 rounded-2xl py-4 font-bold text-white shadow-lg transition-all"
        style={{ backgroundColor: color }}
        onClick={handleCreate}
        disabled={!name}
      >
        Create workout
      </Button>
    </BottomSheet>
  );
};
