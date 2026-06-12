interface ChartPoint {
  date: Date;
  value: number;
}

interface ProgressChartProps {
  data: ChartPoint[];
  /** Target value drawn as a dashed reference line when within range. */
  target: number;
  color?: string;
}

const MAX_POINTS = 10;
const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 150;
const MARGIN = { top: 10, right: 10, bottom: 20, left: 30 };
const TICK_COUNT = 5;

/**
 * Computes "nice" axis ticks (1/2/5 × power of ten spacing) covering
 * [min, max], the standard approach for readable chart axes.
 */
function niceTicks(min: number, max: number): number[] {
  if (min === max) {
    min -= 5;
    max += 5;
  }

  const roughSpacing = (max - min) / (TICK_COUNT - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughSpacing)));
  const normalized = roughSpacing / magnitude;

  let spacing: number;
  if (normalized < 1.5) spacing = 1;
  else if (normalized < 3) spacing = 2;
  else if (normalized < 7) spacing = 5;
  else spacing = 10;
  spacing *= magnitude;

  const ticks: number[] = [];
  const start = Math.floor(min / spacing) * spacing;
  const end = Math.ceil(max / spacing) * spacing;
  for (let tick = start; tick <= end + 0.0001; tick += spacing) {
    ticks.push(tick);
  }
  return ticks;
}

/** Lightweight SVG line chart for an exercise's best weight/reps over time. */
export const ProgressChart = ({ data, target, color }: ProgressChartProps) => {
  if (data.length === 0) return null;

  const points = data.slice(-MAX_POINTS);
  const values = points.map((point) => point.value);
  const dateLabels = points.map((point) =>
    new Date(point.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
  );

  const rangeMin = target > 0 ? Math.min(...values, target) : Math.min(...values);
  const rangeMax = target > 0 ? Math.max(...values, target) : Math.max(...values);
  const ticks = niceTicks(rangeMin, rangeMax);

  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];
  const range = yMax - yMin || 1;

  const graphWidth = VIEW_WIDTH - MARGIN.left - MARGIN.right;
  const graphHeight = VIEW_HEIGHT - MARGIN.top - MARGIN.bottom;

  const getX = (index: number) =>
    points.length === 1
      ? MARGIN.left + graphWidth / 2
      : MARGIN.left + (index / (points.length - 1)) * graphWidth;

  const getY = (value: number) =>
    MARGIN.top + graphHeight - ((value - yMin) / range) * graphHeight;

  const linePoints = values.map((value, index) => `${getX(index)},${getY(value)}`).join(' ');

  const baselineY = MARGIN.top + graphHeight;
  const areaPoints =
    points.length > 1
      ? `${linePoints} ${getX(points.length - 1)},${baselineY} ${getX(0)},${baselineY}`
      : // Single point: draw a small triangular area under the dot.
        `${getX(0)},${getY(values[0])} ${getX(0) + 20},${baselineY} ${getX(0) - 20},${baselineY}`;

  const themeColor = color ?? 'var(--accent)';

  return (
    <div className="relative h-full w-full select-none font-sans">
      <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="h-full w-full overflow-visible">
        {ticks.map((tick, index) => (
          <g key={index}>
            <line
              x1={MARGIN.left}
              y1={getY(tick)}
              x2={VIEW_WIDTH}
              y2={getY(tick)}
              stroke="#333"
              strokeDasharray="2"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={MARGIN.left - 5}
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

        {target > 0 && target >= yMin && target <= yMax && (
          <>
            <line
              x1={MARGIN.left}
              y1={getY(target)}
              x2={VIEW_WIDTH}
              y2={getY(target)}
              stroke={themeColor}
              strokeOpacity="0.5"
              strokeDasharray="4"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
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

        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={themeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={themeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#chartGradient)" />

        {points.length > 1 && (
          <polyline
            points={linePoints}
            fill="none"
            stroke={themeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {values.map((value, index) => (
          <circle
            key={index}
            cx={getX(index)}
            cy={getY(value)}
            r="3"
            fill="#121212"
            stroke={themeColor}
            strokeWidth="1.5"
          />
        ))}

        {dateLabels.map((label, index) => {
          const isEdge = index === 0 || index === dateLabels.length - 1;
          if (points.length > 1 && !isEdge) return null;
          return (
            <text
              key={index}
              x={getX(index)}
              y={VIEW_HEIGHT}
              fill="#71717a"
              fontSize="10"
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
