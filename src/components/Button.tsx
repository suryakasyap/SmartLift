import React from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    fullWidth?: boolean;
}

import { useThemeStore } from '../store/themeStore';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', fullWidth = false, ...props }, ref) => {
        const { appColor } = useThemeStore();

        return (
            <button
                ref={ref}
                className={cn(
                    "font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center",
                    variant === 'primary' && "text-black rounded-xl py-3.5",
                    variant === 'secondary' && "bg-surfaceHighlight text-white rounded-full px-4 py-1.5 text-sm hover:bg-zinc-800",
                    fullWidth ? "w-full" : "w-auto",
                    className
                )}
                style={{
                    backgroundColor: variant === 'primary' ? appColor : undefined,
                    ...props.style
                }}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";
