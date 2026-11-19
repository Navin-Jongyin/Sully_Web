import { useEffect, useState } from 'react';

export function useAdminToast<T>(delay = 5000) {
  const [toast, setToast] = useState<{ value: T; id: number } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), delay);
    return () => window.clearTimeout(timer);
  }, [toast, delay]);

  return {
    value: toast?.value ?? null,
    show: (value: T) => setToast({ value, id: Date.now() }),
    clear: () => setToast(null),
  };
}
