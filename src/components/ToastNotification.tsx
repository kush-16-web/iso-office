import { useEffect, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useStore, type ToastNotice } from '../store';
import { IconButton } from './IconButton';

function ToastCard({ toast }: { toast: ToastNotice }) {
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isHovered) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      return;
    }

    timerRef.current = window.setTimeout(() => {
      useStore.getState().dismissToast(toast.id);
    }, 5500);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [toast.id, isHovered]);

  const kind = toast.kind || 'info';

  const IconComponent =
    kind === 'success'
      ? CheckCircle2
      : kind === 'warn'
      ? AlertTriangle
      : kind === 'error'
      ? AlertCircle
      : Info;

  return (
    <div
      className={`toast toast--${kind}`}
      role="status"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="toast-icon">
        <IconComponent size={16} />
      </div>
      <div className="toast-body">
        {toast.title && <strong className="toast-title">{toast.title}</strong>}
        <span className="toast-message">{toast.text}</span>
      </div>
      <IconButton
        label="Dismiss notification"
        className="toast-close"
        onClick={(e) => {
          e.stopPropagation();
          useStore.getState().dismissToast(toast.id);
        }}
      >
        <X size={14} />
      </IconButton>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  const notice = useStore((s) => s.notice);

  // Fallback to notice if toasts array is empty
  const activeToasts =
    toasts.length > 0 ? toasts : notice ? [notice] : [];

  if (activeToasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label="Notifications" aria-live="polite">
      {activeToasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
