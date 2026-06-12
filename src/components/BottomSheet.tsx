import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
// import { cn } from '../lib/utils'; // Not strictly needed for base functionality but good practice
import type { ReactNode } from 'react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    zIndex?: number;
}



export const BottomSheet = ({ isOpen, onClose, children, title, zIndex = 100 }: BottomSheetProps) => {
    useLockBodyScroll(isOpen);
    const dragControls = useDragControls();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/80"
                        style={{ zIndex: zIndex - 1 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="fixed bottom-0 left-0 right-0 bg-surfaceHighlight rounded-t-3xl p-6 pb-24 max-h-[75vh] overflow-y-auto"
                        style={{ zIndex: zIndex }}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        drag="y"
                        dragControls={dragControls}
                        dragListener={false}
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                    >
                        {/* Handle bar - Drag target */}
                        <div
                            className="w-full flex justify-center py-4 -mt-4 mb-2 cursor-grab active:cursor-grabbing touch-none"
                            onPointerDown={(e) => dragControls.start(e)}
                        >
                            <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
                        </div>

                        <div className="relative mb-6">
                            {title && <h2 className="text-xl font-bold text-center text-white">{title}</h2>}
                            <button
                                onClick={onClose}
                                className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
