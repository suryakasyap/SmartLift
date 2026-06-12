interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xs rounded-2xl border border-zinc-700 bg-zinc-900 p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="mb-1 text-sm font-bold">{title}</p>
        {description && <p className="mb-4 text-xs text-zinc-400">{description}</p>}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl bg-zinc-800 py-2.5 text-xs font-bold text-white transition-colors hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500/20 py-2.5 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/40"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
