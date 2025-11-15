import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: FiCheckCircle,
    className: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    iconClassName: 'text-green-600 dark:text-green-400',
    textClassName: 'text-green-900 dark:text-green-100',
  },
  error: {
    icon: FiAlertCircle,
    className: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    iconClassName: 'text-red-600 dark:text-red-400',
    textClassName: 'text-red-900 dark:text-red-100',
  },
  warning: {
    icon: FiAlertTriangle,
    className: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    iconClassName: 'text-yellow-600 dark:text-yellow-400',
    textClassName: 'text-yellow-900 dark:text-yellow-100',
  },
  info: {
    icon: FiInfo,
    className: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    iconClassName: 'text-blue-600 dark:text-blue-400',
    textClassName: 'text-blue-900 dark:text-blue-100',
  },
};

function ToastItem({ toast, onClose }: ToastProps) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm ${config.className}`}
    >
      <Icon className={`text-xl mt-0.5 flex-shrink-0 ${config.iconClassName}`} />
      <p className={`text-sm flex-1 ${config.textClassName}`}>{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className={`flex-shrink-0 hover:opacity-70 transition-opacity ${config.iconClassName}`}
        aria-label="Close notification"
      >
        <FiX className="text-lg" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
