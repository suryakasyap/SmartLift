import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth = false, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'flex items-center justify-center font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'rounded-xl bg-accent py-3.5 text-black',
        variant === 'secondary' &&
          'rounded-full bg-surface-raised px-4 py-1.5 text-sm text-white hover:bg-zinc-800',
        fullWidth ? 'w-full' : 'w-auto',
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
