import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppDialog } from '../components/AppDialog';

type DialogRequest = {
  type: 'alert' | 'confirm';
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ConfirmOptions = {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export type AppDialogContextValue = {
  alert: (message: string, title?: string) => Promise<void>;
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
};

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

export const AppDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialog, setDialog] = useState<DialogRequest | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const finish = useCallback((result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setDialog(null);
  }, []);

  const alert = useCallback((message: string, title?: string) => {
    return new Promise<void>((resolve) => {
      resolveRef.current = () => resolve();
      setDialog({ type: 'alert', message, title });
    });
  }, []);

  const confirm = useCallback((message: string, options?: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setDialog({
        type: 'confirm',
        message,
        title: options?.title,
        confirmLabel: options?.confirmLabel,
        cancelLabel: options?.cancelLabel,
      });
    });
  }, []);

  useEffect(() => {
    if (!dialog) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        finish(dialog.type === 'confirm' ? false : true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dialog, finish]);

  const value = useMemo(() => ({ alert, confirm }), [alert, confirm]);

  return (
    <AppDialogContext.Provider value={value}>
      {children}
      {dialog && (
        <AppDialog
          type={dialog.type}
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          cancelLabel={dialog.cancelLabel}
          onConfirm={() => finish(true)}
          onCancel={() => finish(false)}
        />
      )}
    </AppDialogContext.Provider>
  );
};

export function useAppDialog(): AppDialogContextValue {
  const context = useContext(AppDialogContext);
  if (!context) {
    throw new Error('useAppDialog must be used within AppDialogProvider');
  }
  return context;
}
