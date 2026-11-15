"use client";

import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  /** Names the action, same word as the button that opened this dialog (for example "Delete"). */
  confirmLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, title, message, confirmLabel, cancelLabel = "Keep it", busy, onConfirm, onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      variant="dialog"
      locked={busy}
      footer={
        <div className="a-actions">
          <button type="button" className="a-btn a-btn-ghost" onClick={onCancel} disabled={busy} data-autofocus>
            {cancelLabel}
          </button>
          <button type="button" className="a-btn a-btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      }
    >
      <p className="a-text">{message}</p>
    </Modal>
  );
}
