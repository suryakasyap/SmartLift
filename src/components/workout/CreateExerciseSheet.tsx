import { BottomSheet } from '../ui/BottomSheet';
import { ExerciseForm } from './ExerciseForm';
import { useWorkoutStore } from '../../store/workoutStore';
import type { Exercise } from '../../db/db';

interface CreateExerciseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Exercise to edit; omit to create a new one. */
  editExercise?: Exercise | null;
}

/** Exercise creation/editing flow presented as a bottom sheet. */
export const CreateExerciseSheet = ({ isOpen, onClose, editExercise }: CreateExerciseSheetProps) => {
  const { addExercise, updateExercise } = useWorkoutStore();

  const handleSubmit = (exercise: Exercise) => {
    if (editExercise) {
      updateExercise(exercise);
    } else {
      addExercise(exercise);
    }
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={editExercise ? 'Edit exercise' : 'New exercise'}
    >
      <ExerciseForm
        // Remount the form when switching between exercises so state resets.
        key={editExercise?.id ?? 'new'}
        initial={editExercise}
        submitLabel={editExercise ? 'Update exercise' : 'Create exercise'}
        onSubmit={handleSubmit}
      />
    </BottomSheet>
  );
};
