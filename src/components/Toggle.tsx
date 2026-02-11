import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface ToggleProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
    activeColor?: string;
}

import { useThemeStore } from '../store/themeStore';

export const Toggle = ({ checked, onCheckedChange, className, activeColor }: ToggleProps) => {
    const { appColor } = useThemeStore();
    return (
        <div
            className={cn(
                "w-12 h-7 rounded-full flex items-center p-1 cursor-pointer transition-colors",
                checked ? "" : "bg-zinc-700",
                className
            )}
            style={{ backgroundColor: checked ? (activeColor || appColor) : undefined }}
            onClick={() => onCheckedChange(!checked)}
        >
            <motion.div
                className="bg-white w-5 h-5 rounded-full shadow-sm"
                animate={{ x: checked ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        </div>
    );
};
