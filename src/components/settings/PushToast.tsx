import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';

export interface PushToastState {
  title: string;
  body: string;
  open: boolean;
}

export function PushToast({ toast, onClose }: { toast: PushToastState; onClose: () => void }) {
  return (
    <AnimatePresence>
      {toast.open && (
        <motion.div
          className="fixed top-4 left-4 right-4 z-[200] max-w-sm mx-auto p-4 rounded-xl border border-primary/20 bg-black/95 shadow-[0_12px_40px_rgba(0,0,0,0.9)] flex gap-3 items-start cursor-pointer hover:bg-black"
          initial={{ opacity: 0, y: -80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 18, stiffness: 200 }}
          onClick={onClose}
          role="alert"
        >
          <div className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-black text-text-primary uppercase tracking-wider">
                {toast.title}
              </span>
              <span className="text-[9px] text-text-muted font-bold uppercase shrink-0">now</span>
            </div>
            <p className="text-[11px] text-text-primary leading-relaxed font-semibold">
              {toast.body}
            </p>
            <div className="mt-2 flex gap-1.5 items-center text-[9px] font-black uppercase text-primary tracking-wider">
              Swipe to View ➔
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
