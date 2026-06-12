import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  /** Overrides the accent colour when checked (e.g. a workout's own colour). */
  activeColor?: string;
}

export const Toggle = ({ checked, onCheckedChange, className, activeColor }: ToggleProps) => (
  <div
    role="switch"
    aria-checked={checked}
    className={cn(
      'flex h-7 w-12 cursor-pointer items-center rounded-full p-1 transition-colors',
      checked ? 'bg-accent' : 'bg-zinc-700',
      className,
    )}
    style={checked && activeColor ? { backgroundColor: activeColor } : undefined}
    onClick={() => onCheckedChange(!checked)}
  >
    <motion.div
      className="h-5 w-5 rounded-full bg-white shadow-sm"
      animate={{ x: checked ? 20 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  </div>
);
