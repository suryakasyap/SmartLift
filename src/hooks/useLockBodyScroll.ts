import { useLayoutEffect } from 'react';

export function useLockBodyScroll(locked: boolean = true) {
    useLayoutEffect(() => {
        if (!locked) return;

        // Save initial body overflow style
        const originalStyle = window.getComputedStyle(document.body).overflow;

        // Prevent scrolling on mount
        document.body.style.overflow = 'hidden';

        // Re-enable scrolling when component unmounts
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [locked]);
}
