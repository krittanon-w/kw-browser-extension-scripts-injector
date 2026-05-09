import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return createPortal(
    <div className="dialog-backdrop" onClick={onCancel}>
      <div className="dialog-box" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={onCancel}>{cancelLabel}</button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Imperative helper hook
import { useState } from 'react';

interface DialogState {
  title: string;
  message: string;
  danger?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function useConfirmDialog() {
  const [dialog, setDialog] = useState<(DialogState & { resolve: (v: boolean) => void }) | null>(null);

  function confirm(opts: DialogState): Promise<boolean> {
    return new Promise(resolve => {
      setDialog({ ...opts, resolve });
    });
  }

  const element: ReactNode = dialog ? (
    <ConfirmDialog
      {...dialog}
      onConfirm={() => { dialog.resolve(true); setDialog(null); }}
      onCancel={() => { dialog.resolve(false); setDialog(null); }}
    />
  ) : null;

  return { confirm, element };
}
