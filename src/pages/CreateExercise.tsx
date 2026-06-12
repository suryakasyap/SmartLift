import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ExerciseForm } from '../components/workout/ExerciseForm';
import { useWorkoutStore } from '../store/workoutStore';
import type { Exercise } from '../db/db';

/**
 * Full-page exercise editor used by the workout page flow. Adds to (or
 * updates within) the current workout draft, then returns.
 */
export default function CreateExercise() {
  const navigate = useNavigate();
  const location = useLocation();
  const exerciseToEdit: Exercise | undefined = location.state?.exercise;

  const { addExercise, updateExercise } = useWorkoutStore();

  const handleSubmit = (exercise: Exercise) => {
    if (exerciseToEdit) {
      updateExercise(exercise);
    } else {
      addExercise(exercise);
    }
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background p-6 pb-8 text-white">
      <header className="relative mb-8 flex items-center justify-center">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="absolute left-0 top-1/2 -ml-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-zinc-400 transition-colors hover:text-white"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold">{exerciseToEdit ? 'Edit exercise' : 'New exercise'}</h1>
      </header>

      <ExerciseForm
        initial={exerciseToEdit}
        submitLabel={exerciseToEdit ? 'Update exercise' : 'Create exercise'}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
