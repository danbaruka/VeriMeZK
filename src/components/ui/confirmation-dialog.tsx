import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmationDialogProps) {
  const variants = {
    danger: {
      icon: 'text-black dark:text-white',
      button: 'bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800',
    },
    warning: {
      icon: 'text-black dark:text-white',
      button: 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80',
    },
    info: {
      icon: 'text-black dark:text-white',
      button: 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80',
    },
  };

  const config = variants[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 border border-black/10 dark:border-white/10 pointer-events-auto"
            >
              <div className="flex items-start gap-4 mb-4">
                <FiAlertTriangle className={`text-2xl mt-1 ${config.icon}`} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-black dark:text-white border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all ${config.button}`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
