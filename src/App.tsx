import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateWorkout from './pages/CreateWorkout';
import CreateExercise from './pages/CreateExercise';
import { Layout } from './components/Layout';
import HistoryPage from './pages/History'; // Rename import to avoid conflict
import Stats from './pages/Stats';
import Settings from './pages/Settings';

import WorkoutSession from './pages/WorkoutSession';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        {/* Pages without bottom nav if needed, or included: */}
        <Route path="/create-workout" element={<CreateWorkout />} />
        <Route path="/create-exercise" element={<CreateExercise />} />
        <Route path="/workout/:id" element={<WorkoutSession />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
