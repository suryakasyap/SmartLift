import { cn } from '../lib/utils';
import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card = ({ children, className, onClick }: CardProps) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-surface rounded-xl p-4",
                onClick && "cursor-pointer active:scale-95 transition-transform",
                className
            )}
        >
            {children}
        </div>
    );
};
