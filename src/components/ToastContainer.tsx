import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { Toast } from '@/hooks/useToast';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="toast-container">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={`toast toast--${t.type}`}
            onClick={() => onDismiss(t.id)}
          >
            <Icon />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
