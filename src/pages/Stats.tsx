import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { TrendingUp, Target, Calendar, BarChart2 } from 'lucide-react';
import { StatCard } from '../components/stats/StatCard';
import { ProgressChart } from '../components/stats/ProgressChart';
import { db } from '../db/db';
import { useThemeStore } from '../store/themeStore';
import { cn } from '../lib/utils';

type Metric = 'weight' | 'reps';

interface SessionBest {
  date: Date;
  weight: number;
  reps: number;
}

export default function Stats() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [metric, setMetric] = useState<Metric>('weight');
  const { appColor } = useThemeStore();

  const exercises = useLiveQuery(() => db.exercises.toArray());

  // Defaults to the first exercise until the user picks one.
  const selectedExercise =
    exercises?.find((exercise) => exercise.id === selectedExerciseId) ?? exercises?.[0];

  // Best weight and reps per logged session of the selected exercise.
  // Logs reference exercises by name so history survives re-creation.
  const sessionBests = useLiveQuery(async (): Promise<SessionBest[]> => {
    if (!selectedExercise) return [];

    const allLogs = await db.workoutLogs.orderBy('date').toArray();
    return allLogs
      .map((log) => {
        const entry = log.exercises?.find((exercise) => exercise.name === selectedExercise.name);
        if (!entry) return null;
        return {
          date: log.date,
          weight: Math.max(...entry.sets.map((set) => parseFloat(set.weight) || 0)),
          reps: Math.max(...entry.sets.map((set) => parseFloat(set.reps) || 0)),
        };
      })
      .filter(
        (best): best is SessionBest => best !== null && (best.weight > 0 || best.reps > 0),
      );
  }, [selectedExercise]);

  const stats = useMemo(() => {
    if (!sessionBests || sessionBests.length === 0 || !selectedExercise) return null;

    const valueOf = (best: SessionBest) => (metric === 'weight' ? best.weight : best.reps);
    const currentBest = valueOf(sessionBests[sessionBests.length - 1]);
    const target =
      metric === 'weight'
        ? selectedExercise.target_weight || 0
        : selectedExercise.target_reps || 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const olderBests = sessionBests.filter((best) => best.date <= oneWeekAgo);
    const reference = olderBests[olderBests.length - 1] ?? sessionBests[0];
    const lastWeekBest = valueOf(reference);

    return {
      currentBest,
      lastWeekBest,
      progress: currentBest - lastWeekBest,
      target,
      unit: metric === 'weight' ? 'kg' : 'reps',
    };
  }, [sessionBests, selectedExercise, metric]);

  const chartData = useMemo(
    () =>
      (sessionBests ?? []).map((best) => ({
        date: best.date,
        value: metric === 'weight' ? best.weight : best.reps,
      })),
    [sessionBests, metric],
  );

  const metricButton = (value: Metric, label: string) => (
    <button
      onClick={() => setMetric(value)}
      className={cn(
        'rounded-full px-3 py-1 text-xs font-bold transition-all',
        metric === value ? 'bg-accent text-black' : 'text-zinc-400',
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background p-6 pb-24 text-white">
      <h1 className="mb-6 text-2xl font-bold">Statistics</h1>

      <div className="scrollbar-hide mb-8 overflow-x-auto pb-2">
        <div className="flex gap-2">
          {exercises?.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => setSelectedExerciseId(exercise.id)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
                selectedExercise?.id === exercise.id
                  ? 'bg-accent text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700',
              )}
            >
              {exercise.name}
            </button>
          ))}
        </div>
      </div>

      {selectedExercise && sessionBests && sessionBests.length > 0 ? (
        <>
          <div className="mb-6 grid grid-cols-3 gap-2">
            <StatCard
              icon={<Calendar className="h-4 w-4 text-blue-500" />}
              label="Last Week"
              value={stats?.lastWeekBest}
              unit={stats?.unit}
              subtext="Best last week"
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4 text-green-500" />}
              label="Progress"
              value={stats?.progress}
              unit={stats?.unit}
              subtext="Since last week"
              trend={stats?.progress}
            />
            <StatCard
              icon={<Target className="h-4 w-4 text-yellow-500" />}
              label="Target"
              value={stats?.target}
              unit={stats?.unit}
              subtext={`${Math.max(0, (stats?.target ?? 0) - (stats?.currentBest ?? 0))} to goal`}
            />
          </div>

          <div className="mb-6 rounded-3xl bg-surface p-6 shadow-lg shadow-black/50">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold capitalize text-zinc-100">{metric}</h2>
                <p className="text-sm text-zinc-500">Last {sessionBests.length} sessions</p>
              </div>

              <div className="flex rounded-full bg-zinc-800 p-1">
                {metricButton('weight', 'Weight')}
                {metricButton('reps', 'Reps')}
              </div>
            </div>

            <div className="relative h-48 w-full">
              <ProgressChart data={chartData} target={stats?.target ?? 0} color={appColor} />
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
          <BarChart2 className="mb-4 h-12 w-12 opacity-20" />
          <p>No data available for this exercise yet.</p>
          <p className="mt-2 text-sm">Complete a workout to see stats.</p>
        </div>
      )}
    </div>
  );
}
