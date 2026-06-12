import { cn } from '../../lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value?: number;
  unit?: string;
  subtext: string;
  /** When provided, renders a signed +/- delta instead of the subtext. */
  trend?: number;
}

export const StatCard = ({ icon, label, value, unit, subtext, trend }: StatCardProps) => (
  <div className="flex min-h-[120px] flex-col justify-between rounded-2xl bg-surface p-4">
    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900">
      {icon}
    </div>
    <div>
      <p className="mb-1 text-xs font-medium text-zinc-400">{label}</p>
      <div className="mb-1 flex items-baseline gap-1">
        <span className="text-xl font-bold text-white">{value}</span>
        <span className="text-[10px] font-medium text-zinc-500">{unit}</span>
      </div>
      {trend !== undefined && trend !== 0 ? (
        <div
          className={cn(
            'flex items-center gap-1 text-[10px] font-bold',
            trend >= 0 ? 'text-green-500' : 'text-red-500',
          )}
        >
          {trend > 0 ? '+' : ''}
          {trend}
        </div>
      ) : (
        <p className="text-[10px] leading-tight text-zinc-500">{subtext}</p>
      )}
    </div>
  </div>
);
