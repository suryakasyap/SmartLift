import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Calendar as CalendarIcon, LayoutGrid, List } from 'lucide-react';
import { HistoryCard } from '../components/history/HistoryCard';
import { db } from '../db/db';
import { cn } from '../lib/utils';

const VIEW_MODE_STORAGE_KEY = 'historyViewMode';

export default function History() {
  const history = useLiveQuery(() => db.workoutLogs.orderBy('date').reverse().toArray());

  const [isGridView, setIsGridView] = useState(() => {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return saved ? saved === 'grid' : true;
  });

  const toggleView = () => {
    setIsGridView((current) => {
      const next = !current;
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, next ? 'grid' : 'list');
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24 pt-12 text-white">
      <div className="mb-8 flex items-center justify-between px-2">
        <h1 className="text-3xl font-bold">History</h1>
        <button
          onClick={toggleView}
          aria-label={isGridView ? 'Switch to list view' : 'Switch to grid view'}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:text-white"
        >
          {isGridView ? <List className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
        </button>
      </div>

      <div className={isGridView ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-8'}>
        {history?.map((log) => (
          <HistoryCard key={log.id} log={log} isGridView={isGridView} />
        ))}

        {(!history || history.length === 0) && (
          <div
            className={cn(
              'flex flex-col items-center py-20 text-center text-zinc-500',
              isGridView && 'col-span-2',
            )}
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-zinc-600">
              <CalendarIcon className="h-8 w-8" />
            </div>
            <p className="font-bold text-zinc-400">No history yet</p>
            <p className="mt-1 text-xs">Complete a workout to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
