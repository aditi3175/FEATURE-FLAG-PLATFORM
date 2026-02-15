import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  projectName: string;
}

export default function DeleteConfirmDialog({ isOpen, onClose, onConfirm, projectName }: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[60]"
          >
            <div className="glass-surface inner-glow rounded-xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Delete Project</h2>
                </div>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-2">
                  Are you sure you want to delete <span className="text-white font-medium">{projectName}</span>?
                </p>
                <p className="text-xs text-gray-500">
                  This will permanently delete the project and all its feature flags. This action cannot be undone.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  onClick={handleConfirm}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Deleting...' : 'Delete Project'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
