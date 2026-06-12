import React from 'react';
import { cn } from '../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, containerClassName, ...props }, ref) => {
        return (
            <div className={cn("w-full", containerClassName)}>
                {label && <label className="block text-textSecondary text-sm font-semibold mb-2 ml-1">{label}</label>}
                <input
                    ref={ref}
                    className={cn(
                        "w-full bg-surfaceHighlight text-white rounded-xl px-4 py-3 placeholder:text-zinc-600 font-medium",
                        "focus:outline-none focus:ring-1 focus:ring-primary transition-all",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);
Input.displayName = "Input";
