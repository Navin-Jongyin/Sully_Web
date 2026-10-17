import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import './AppDialog.css';

type AppDialogProps = {
  type: 'alert' | 'confirm';
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const AppDialog: React.FC<AppDialogProps> = ({
  type,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmButtonRef.current?.focus();
  }, []);

  return (
    <div
      className="app-dialog-overlay"
      role="presentation"
      onClick={type === 'confirm' ? onCancel : undefined}
    >
      <div
        className="app-dialog"
        role={type === 'confirm' ? 'alertdialog' : 'alert'}
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        aria-describedby="app-dialog-message"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="app-dialog-title" className="app-dialog-title">
          {title ?? (type === 'confirm' ? t.common.confirmTitle : t.common.noticeTitle)}
        </h2>
        <p id="app-dialog-message" className="app-dialog-message">
          {message}
        </p>
        <div className="app-dialog-actions">
          {type === 'confirm' && (
            <button type="button" className="button button-secondary" onClick={onCancel}>
              {cancelLabel ?? t.common.cancel}
            </button>
          )}
          <button
            ref={confirmButtonRef}
            type="button"
            className="button button-primary"
            onClick={onConfirm}
          >
            {confirmLabel ?? t.common.ok}
          </button>
        </div>
      </div>
    </div>
  );
};
