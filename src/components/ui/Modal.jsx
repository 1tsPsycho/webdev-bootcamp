import { motion, AnimatePresence } from 'motion/react';
import { CloseIcon } from './Icons';

export function Modal({ open, onClose, title, children, dismissible = true }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className="absolute inset-0 bg-ink/80"
            onClick={dismissible ? onClose : undefined}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="ff-surface relative w-full max-w-md p-6"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start justify-between mb-4">
              {title && <h2 className="font-display text-2xl text-parchment">{title}</h2>}
              {dismissible && (
                <button
                  onClick={onClose}
                  className="text-muted hover:text-gold transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
