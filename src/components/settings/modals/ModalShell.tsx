import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md';
  scrollable?: boolean;
  footer?: ReactNode;
}

/** Bottom-sheet-on-mobile / centered-dialog-on-desktop modal used by settings. */
export function ModalShell({
  open,
  onClose,
  title,
  children,
  maxWidth = 'sm',
  scrollable = false,
  footer,
}: ModalShellProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={
              'relative w-full bg-bg-surface border border-border p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl ' +
              (maxWidth === 'md' ? 'max-w-md ' : 'max-w-sm ') +
              (scrollable ? 'h-[85dvh] sm:h-auto flex flex-col overflow-hidden' : 'space-y-6')
            }
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          >
            <div
              className={
                'flex justify-between items-center border-b border-border pb-3 ' +
                (scrollable ? 'shrink-0' : '')
              }
            >
              <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-bg-surface-hover transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {scrollable ? (
              <div className="flex-1 overflow-y-auto p-0 pt-4 space-y-6 no-scrollbar">
                {children}
              </div>
            ) : (
              children
            )}
            {footer && <div className="pt-4 border-t border-border shrink-0">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
