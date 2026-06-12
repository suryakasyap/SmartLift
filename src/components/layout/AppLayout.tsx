import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { CreateWorkoutSheet } from '../workout/CreateWorkoutSheet';
import { CreateExerciseSheet } from '../workout/CreateExerciseSheet';
import { useUiStore } from '../../store/uiStore';

/** Shell for the tabbed pages: bottom navigation plus the global creation sheets. */
export const AppLayout = () => {
  const {
    isWorkoutSheetOpen,
    closeWorkoutSheet,
    isExerciseSheetOpen,
    closeExerciseSheet,
    openExerciseSheet,
    exerciseBeingEdited,
  } = useUiStore();

  return (
    <div className="min-h-screen bg-background pb-24 font-sans text-white">
      <main className="relative mx-auto min-h-screen max-w-md">
        <Outlet />
      </main>
      <BottomNav />

      <CreateWorkoutSheet
        isOpen={isWorkoutSheetOpen}
        onClose={closeWorkoutSheet}
        onExerciseAdd={() => openExerciseSheet()}
        onExerciseEdit={openExerciseSheet}
      />
      <CreateExerciseSheet
        isOpen={isExerciseSheetOpen}
        onClose={closeExerciseSheet}
        editExercise={exerciseBeingEdited}
      />
    </div>
  );
};
