import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { TrendingUp, Target, Calendar, BarChart2 } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export default function Stats() {
    // State for selected exercise ID
    const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
    // State for metric (weight or reps)
    const [metric, setMetric] = useState<'weight' | 'reps'>('weight');
    const { appColor } = useThemeStore();

    // Fetch exercises
    const exercises = useLiveQuery(() => db.exercises.toArray());

    // Fetch logs for the selected exercise
    const logs = useLiveQuery(async () => {
        if (!selectedExerciseId || !exercises) return [];
        const exercise = exercises.find(e => e.id === selectedExerciseId);
        if (!exercise) return [];

        const allLogs = await db.workoutLogs.orderBy('date').toArray();
        return allLogs.filter(log =>
            log.exercises?.some(e => e.name === exercise.name)
        ).map(log => {
            const exerciseLog = log.exercises?.find(e => e.name === exercise.name);
            if (!exerciseLog) return null;

            // Extract BOTH max weight and max reps
            const maxWeight = Math.max(...exerciseLog.sets.map(s => parseFloat(s.weight) || 0));
            const maxReps = Math.max(...exerciseLog.sets.map(s => parseFloat(s.reps) || 0));

            return {
                date: log.date,
                weight: maxWeight,
                reps: maxReps
            };
        }).filter((item): item is { date: Date; weight: number; reps: number } => item !== null && (item.weight > 0 || item.reps > 0));
    }, [selectedExerciseId, exercises]);

    // Set default selected exercise
    if (selectedExerciseId === null && exercises && exercises.length > 0) {
        setSelectedExerciseId(exercises[0].id);
    }

    const selectedExercise = exercises?.find(e => e.id === selectedExerciseId);

    // Calculate stats
    const stats = useMemo(() => {
        if (!logs || logs.length === 0 || !selectedExercise) return null;

        // Determine which value to use
        const currentBest = metric === 'weight' ? logs[logs.length - 1].weight : logs[logs.length - 1].reps;

        let target = 0;
        if (metric === 'weight') target = selectedExercise.target_weight || 0;
        else target = selectedExercise.target_reps || 0;

        // Last week best (approx 7 days ago)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const lastWeekLogs = logs.filter(l => l.date <= oneWeekAgo);
        const lastLog = lastWeekLogs.length > 0 ? lastWeekLogs[lastWeekLogs.length - 1] : logs[0];
        const lastWeekBest = lastLog ? (metric === 'weight' ? lastLog.weight : lastLog.reps) : 0;

        const progress = currentBest - lastWeekBest;

        return {
            currentBest,
            lastWeekBest,
            progress,
            target,
            unit: metric === 'weight' ? 'kg' : 'reps'
        };
    }, [logs, selectedExercise, metric]);

    // Prepare chart data
    const chartData = useMemo(() => {
        if (!logs) return [];
        return logs.map(l => ({
            date: l.date,
            value: metric === 'weight' ? l.weight : l.reps
        }));
    }, [logs, metric]);


    return (
        <div className="p-6 pb-24 min-h-screen bg-background text-white">
            <h1 className="text-2xl font-bold mb-6">Statistics</h1>

            {/* Exercise Selector */}
            <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex gap-2">
                    {exercises?.map(exercise => (
                        <button
                            key={exercise.id}
                            onClick={() => setSelectedExerciseId(exercise.id)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${selectedExerciseId === exercise.id
                                ? 'text-black'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                }`}
                            style={{
                                backgroundColor: selectedExerciseId === exercise.id ? appColor : undefined
                            }}
                        >
                            {exercise.name}
                        </button>
                    ))}
                </div>
            </div>

            {selectedExercise && logs && logs.length > 0 ? (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <StatCard
                            icon={<Calendar className="w-4 h-4 text-blue-500" />}
                            label="Last Week"
                            value={stats?.lastWeekBest}
                            unit={stats?.unit}
                            subtext="Best last week"
                        />
                        <StatCard
                            icon={<TrendingUp className="w-4 h-4 text-green-500" />}
                            label="Progress"
                            value={stats?.progress}
                            unit={stats?.unit}
                            subtext="Since last week"
                            trend={stats?.progress}
                        />
                        <StatCard
                            icon={<Target className="w-4 h-4 text-yellow-500" />}
                            label="Target"
                            value={stats?.target}
                            unit={stats?.unit}
                            subtext={`${Math.max(0, (stats?.target || 0) - (stats?.currentBest || 0))} to goal`}
                        />
                    </div>

                    {/* Chart Card */}
                    <div className="bg-surface p-6 rounded-3xl mb-6 shadow-lg shadow-black/50">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-100 capitalize">{metric}</h2>
                                <p className="text-zinc-500 text-sm">Last {logs.length} sessions</p>
                            </div>

                            {/* Metric Toggle */}
                            <div className="flex bg-zinc-800 rounded-full p-1">
                                <button
                                    onClick={() => setMetric('weight')}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${metric === 'weight' ? 'text-black' : 'text-zinc-400'}`}
                                    style={{
                                        backgroundColor: metric === 'weight' ? appColor : 'transparent'
                                    }}
                                >
                                    Weight
                                </button>
                                <button
                                    onClick={() => setMetric('reps')}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${metric === 'reps' ? 'text-black' : 'text-zinc-400'}`}
                                    style={{
                                        backgroundColor: metric === 'reps' ? appColor : 'transparent'
                                    }}
                                >
                                    Reps
                                </button>
                            </div>
                        </div>

                        {/* Custom SVG Chart */}
                        <div className="h-48 w-full relative">
                            <Chart data={chartData} target={stats?.target || 0} color={appColor} />
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                    <BarChart2 className="w-12 h-12 mb-4 opacity-20" />
                    <p>No data available for this exercise yet.</p>
                    <p className="text-sm mt-2">Complete a workout to see stats.</p>
                </div>
            )}
        </div>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value?: number;
    unit?: string;
    subtext: string;
    trend?: number;
}

function StatCard({ icon, label, value, unit, subtext, trend }: StatCardProps) {
    return (
        <div className="bg-surface p-4 rounded-2xl flex flex-col justify-between min-h-[120px]">
            <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center mb-2">
                {icon}
            </div>
            <div>
                <p className="text-zinc-400 text-xs font-medium mb-1">{label}</p>
                <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-xl font-bold text-white">{value}</span>
                    <span className="text-[10px] text-zinc-500 font-medium">{unit}</span>
                </div>
                {trend !== undefined && (
                    <div className={`text-[10px] font-bold flex items-center gap-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trend > 0 ? '+' : ''}{trend}
                    </div>
                )}
                {!trend && <p className="text-[10px] text-zinc-500 leading-tight">{subtext}</p>}
            </div>
        </div>
    );
}

function Chart({ data, target, color }: { data: { date: Date; value: number }[], target: number, color?: string }) {
    if (!data || data.length === 0) return null;

    // Normalize data (show last 10 points)
    const chartData = data.slice(-10);
    const values = chartData.map(d => d.value);
    const dates = chartData.map(d => new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));

    // --- Dynamic Range & Nice Ticks Calculation ---
    // Calculate raw min/max
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);

    // Include target in visible range logic (but nice ticks will override)
    let min = rawMin;
    let max = rawMax;
    if (target > 0) {
        min = Math.min(min, target);
        max = Math.max(max, target);
    }

    // Default padding if flat
    if (min === max) {
        min -= 5;
        max += 5;
    }

    // "Nice" Number Algorithm (Simplified)
    // Goal: 4-5 ticks covering the range [min, max]
    const targetTickCount = 5;
    const grossRange = max - min;
    const roughTickSpacing = grossRange / (targetTickCount - 1);

    // Round to nice interval (1, 2, 5, 10, etc.)
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughTickSpacing)));
    const normalizedSpacing = roughTickSpacing / magnitude;
    let niceSpacing;
    if (normalizedSpacing < 1.5) niceSpacing = 1;
    else if (normalizedSpacing < 3) niceSpacing = 2;
    else if (normalizedSpacing < 7) niceSpacing = 5;
    else niceSpacing = 10;
    niceSpacing *= magnitude;

    // Calculate new nice min/max
    const niceMin = Math.floor(min / niceSpacing) * niceSpacing;
    const niceMax = Math.ceil(max / niceSpacing) * niceSpacing;

    // Generate ticks
    const ticks = [];
    for (let current = niceMin; current <= niceMax + 0.0001; current += niceSpacing) {
        ticks.push(current);
    }

    // Final check to ensure we cover the data (nice algorithm usually does, but just in case)
    const yMin = ticks[0];
    const yMax = ticks[ticks.length - 1];
    const range = yMax - yMin || 1; // Avoid divide by zero

    // --- SVG Coordinate System ---
    // Use a wider aspect ratio viewBox to minimize distortion of circles
    // Assuming mobile width ~350px and height 192px -> ~300x160 viewBox
    const VIEW_WIDTH = 300;
    const VIEW_HEIGHT = 150;

    // Margins inside SVG coods
    const mL = 30; // Left (labels)
    const mR = 10;
    const mT = 10;
    const mB = 20; // Bottom (dates)

    const graphWidth = VIEW_WIDTH - mL - mR;
    const graphHeight = VIEW_HEIGHT - mT - mB;

    const getX = (i: number) => {
        if (chartData.length === 1) return mL + graphWidth / 2;
        return mL + (i / (chartData.length - 1)) * graphWidth;
    };

    const getY = (val: number) => {
        return mT + graphHeight - ((val - yMin) / range) * graphHeight;
    };

    const points = values.map((val, i) => `${getX(i)},${getY(val)}`).join(' ');

    // Area closure
    let areaPoints = '';
    if (chartData.length > 1) {
        areaPoints = `${points} ${getX(chartData.length - 1)},${mT + graphHeight} ${getX(0)},${mT + graphHeight}`;
    } else {
        // For single point, create a small "tent" or just a bar area
        const x = getX(0);
        const y = getY(values[0]);
        const width = 20;
        areaPoints = `${x},${y} ${x + width},${mT + graphHeight} ${x - width},${mT + graphHeight}`;
    }

    const themeColor = color || '#10B981';

    return (
        <div className="w-full h-full relative font-sans select-none">
            <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="w-full h-full overflow-visible">

                {/* Y-Axis Grid & Labels */}
                {ticks.map((tick, i) => (
                    <g key={i}>
                        <line
                            x1={mL}
                            y1={getY(tick)}
                            x2={VIEW_WIDTH}
                            y2={getY(tick)}
                            stroke="#333"
                            strokeDasharray="2"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                        />
                        <text
                            x={mL - 5}
                            y={getY(tick)}
                            fill="#71717a"
                            fontSize="10"
                            textAnchor="end"
                            dominantBaseline="middle"
                        >
                            {Math.round(tick)}
                        </text>
                    </g>
                ))}

                {/* Target Line */}
                {target > 0 && target <= yMax && target >= yMin && (
                    <>
                        <line
                            x1={mL}
                            y1={getY(target)}
                            x2={VIEW_WIDTH}
                            y2={getY(target)}
                            stroke={themeColor}
                            strokeOpacity="0.5"
                            strokeDasharray="4"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                        />
                        {/* Target Label */}
                        <text
                            x={VIEW_WIDTH}
                            y={getY(target) - 4}
                            fill={themeColor}
                            fontSize="10"
                            textAnchor="end"
                            fontWeight="bold"
                        >
                            Target
                        </text>
                    </>
                )}

                {/* Area Gradient */}
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={themeColor} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={themeColor} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polygon points={areaPoints} fill="url(#chartGradient)" />

                {/* Line */}
                {chartData.length > 1 && (
                    <polyline
                        points={points}
                        fill="none"
                        stroke={themeColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />
                )}

                {/* Dots */}
                {values.map((val, i) => (
                    <circle
                        key={i}
                        cx={getX(i)}
                        cy={getY(val)}
                        r="3"
                        fill="#121212"
                        stroke={themeColor}
                        strokeWidth="1.5"
                    />
                ))}

                {/* X-Axis Labels */}
                {dates.map((d, i) => (
                    ((i === 0 || i === dates.length - 1) && chartData.length > 1) || chartData.length === 1 ? (
                        <text
                            key={i}
                            x={getX(i)}
                            y={VIEW_HEIGHT}
                            fill="#71717a"
                            fontSize="10"
                            textAnchor="middle"
                        >
                            {d}
                        </text>
                    ) : null
                ))}
            </svg>
        </div>
    );
}

