import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Home from './pages/Home';
import History from './pages/History';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import CreateWorkout from './pages/CreateWorkout';
import CreateExercise from './pages/CreateExercise';
import WorkoutSession from './pages/WorkoutSession';
import { useThemeStore } from './store/themeStore';

/** Keeps the CSS accent variables in sync with the user's theme colour. */
function useAccentColor() {
  const appColor = useThemeStore((state) => state.appColor);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', appColor);
    root.style.setProperty('--accent-soft', `${appColor}33`);
  }, [appColor]);
}

export default function App() {
  useAccentColor();

  return (
    <HashRouter>
      <Routes>
        {/* Tabbed pages share the bottom navigation shell. */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Full-screen flows without the bottom navigation. */}
        <Route path="/create-workout" element={<CreateWorkout />} />
        <Route path="/create-exercise" element={<CreateExercise />} />
        <Route path="/workout/:id" element={<WorkoutSession />} />
      </Routes>
    </HashRouter>
  );
}
