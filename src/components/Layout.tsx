import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { CreateWorkoutSheet } from './CreateWorkoutSheet';
import { CreateExerciseSheet } from './CreateExerciseSheet';
import { useUIStore } from '../store/uiStore';

export const Layout = () => {
    const {
        isCreateWorkoutOpen, closeCreateWorkout,
        isCreateExerciseOpen, closeCreateExercise,
        openCreateExercise
    } = useUIStore();

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <main className="max-w-md mx-auto min-h-screen relative">
                <Outlet />
            </main>
            <BottomNav />

            <CreateWorkoutSheet
                isOpen={isCreateWorkoutOpen}
                onClose={closeCreateWorkout}
                onExerciseAdd={openCreateExercise}
            />
            <CreateExerciseSheet
                isOpen={isCreateExerciseOpen}
                onClose={closeCreateExercise}
            />
        </div>
    );
};
