import { Home, BarChart2, Settings, Calendar, Plus } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useUiStore } from '../../store/uiStore';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Calendar, label: 'History', path: '/history' },
  { icon: BarChart2, label: 'Stats', path: '/stats' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const BottomNav = () => {
  const openWorkoutSheet = useUiStore((state) => state.openWorkoutSheet);
  const [homeItem, historyItem, ...rightItems] = NAV_ITEMS;

  const renderLink = ({ icon: Icon, label, path }: (typeof NAV_ITEMS)[number]) => (
    <NavLink
      key={path}
      to={path}
      aria-label={label}
      className={({ isActive }) =>
        cn(
          'p-2 transition-colors duration-200',
          isActive ? 'text-white' : 'text-zinc-600 hover:text-zinc-400',
        )
      }
    >
      {({ isActive }) => <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />}
    </NavLink>
  );

  return (
    <nav className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-zinc-800/50 bg-zinc-900/90 px-6 py-3 shadow-2xl backdrop-blur-md">
      {[homeItem, historyItem].map(renderLink)}

      <button
        onClick={openWorkoutSheet}
        aria-label="Create workout"
        className="cursor-pointer rounded-full bg-zinc-800 p-3 transition-colors hover:bg-zinc-700"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {rightItems.map(renderLink)}
    </nav>
  );
};
