import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { WorkoutFormFields } from '../components/workout/WorkoutFormFields';
import { db, type Workout } from '../db/db';
import { useWorkoutStore } from '../store/workoutStore';
import { useThemeStore } from '../store/themeStore';
import { saveWorkout } from '../lib/workouts';

/**
 * Full-page workout editor. Reached with a workout in route state when
 * editing; otherwise creates a new draft.
 */
export default function CreateWorkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const workoutToEdit: Workout | undefined = location.state?.workout;

  const { name, color, exercises, editingId, updateDraft, loadWorkout, reset } = useWorkoutStore();
  const { appColor } = useThemeStore();

  // New drafts start from the user's theme colour.
  useEffect(() => {
    if (!editingId && !workoutToEdit) {
      updateDraft({ color: appColor });
    }
  }, [appColor, editingId, workoutToEdit, updateDraft]);

  // Hydrate the draft when arriving with a workout to edit. Skipped when the
  // draft already holds this workout (e.g. returning from the exercise page).
  useEffect(() => {
    if (!workoutToEdit) return;
    if (useWorkoutStore.getState().editingId === workoutToEdit.id) return;

    db.exercises
      .where('workoutId')
      .equals(workoutToEdit.id)
      .toArray()
      .then((workoutExercises) => loadWorkout(workoutToEdit, workoutExercises, appColor));
  }, [workoutToEdit, loadWorkout, appColor]);

  const handleSave = async () => {
    if (!name) return;
    await saveWorkout(useWorkoutStore.getState(), exercises, editingId);
    reset();
    navigate('/');
  };

  const handleCancel = () => {
    reset();
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background p-6 pb-8 text-white">
      <header className="mb-8 flex items-center justify-between">
        <button
          onClick={handleCancel}
          aria-label="Back"
          className="-ml-2 flex h-10 w-10 items-center justify-center text-zinc-400 transition-colors hover:text-white"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold">{editingId ? 'Edit Workout' : 'New workout'}</h1>
        <div className="w-10" />
      </header>

      <input
        type="text"
        placeholder="Workout name"
        value={name}
        onChange={(event) => updateDraft({ name: event.target.value })}
        className="mb-2 w-full bg-transparent text-4xl font-bold text-white caret-accent outline-none placeholder:text-zinc-800"
      />

      <div className="mt-8">
        <WorkoutFormFields
          onAddExercise={() => navigate('/create-exercise')}
          onEditExercise={(exercise) => navigate('/create-exercise', { state: { exercise } })}
        />
      </div>

      <Button
        fullWidth
        className="mt-auto w-full rounded-2xl py-4 font-bold text-white shadow-lg transition-all"
        style={{
          backgroundColor: name ? color : appColor,
          boxShadow: name ? `0 10px 15px -3px ${color}33` : undefined,
        }}
        onClick={handleSave}
        disabled={!name}
      >
        {editingId ? 'Save Changes' : 'Create workout'}
      </Button>
    </div>
  );
}
