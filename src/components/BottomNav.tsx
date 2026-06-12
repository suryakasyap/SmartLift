import { Home, BarChart2, Settings, Calendar, Plus } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useUIStore } from '../store/uiStore';

export const BottomNav = () => {
    const location = useLocation();
    const openCreateWorkout = useUIStore(state => state.openCreateWorkout);

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Calendar, label: 'History', path: '/history' },
        { icon: Plus, label: 'Create', path: '/create-workout', isSpecial: true }, // Central action button
        { icon: BarChart2, label: 'Stats', path: '/stats' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-zinc-800/50 z-50">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;

                if (item.isSpecial) {
                    return (
                        <button
                            key={item.path}
                            onClick={openCreateWorkout}
                            className="bg-zinc-800 p-3 rounded-full cursor-pointer hover:bg-zinc-700 transition-colors"
                        >
                            <item.icon className="text-white w-6 h-6" />
                        </button>
                    );
                }

                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "p-2 transition-colors duration-200",
                            isActive ? "text-white" : "text-zinc-600 hover:text-zinc-400"
                        )}
                    >
                        <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    </NavLink>
                );
            })}
        </div>
    );
};
