import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

const DRAG_DISMISS_THRESHOLD_PX = 100;

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  /** Raise this for sheets stacked on top of other sheets. */
  zIndex?: number;
}

export const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
  zIndex = 100,
}: BottomSheetProps) => {
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
            className="fixed bottom-0 left-0 right-0 max-h-[75vh] overflow-y-auto rounded-t-3xl bg-surface-raised p-6 pb-24"
            style={{ zIndex }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > DRAG_DISMISS_THRESHOLD_PX) onClose();
            }}
          >
            <div
              className="-mt-4 mb-2 flex w-full cursor-grab touch-none justify-center py-4 active:cursor-grabbing"
              onPointerDown={(event) => dragControls.start(event)}
            >
              <div className="h-1.5 w-12 rounded-full bg-zinc-700" />
            </div>

            <div className="relative mb-6">
              {title && <h2 className="text-center text-xl font-bold text-white">{title}</h2>}
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
