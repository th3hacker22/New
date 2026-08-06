import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QrShareModalProps {
  open: boolean;
  onClose: () => void;
  isAr: boolean;
}

export function QrShareModal({ open, onClose, isAr }: QrShareModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-sm rounded-2xl border border-border bg-bg-surface p-6 shadow-2xl text-center space-y-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="flex justify-between items-center border-b border-border pb-3 text-right">
              <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                {isAr ? 'الـ QR بتاعك' : 'ReLift QR Share'}
              </h3>
              <button onClick={onClose} className="text-text-muted hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl inline-block mx-auto border-4 border-primary">
              <svg
                className="w-40 h-40 text-black mx-auto"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <path
                  d="M0,0h30v30h-30z M10,10h10v10h-10z M0,70h30v30h-30z M10,80h10v10h-10z M70,0h30v30h-30z M80,10h10v10h-10z M40,10h10v10h-10z M50,40h10v10h-10z M30,50h10v10h-10z M60,60h10v10h-10z M80,80h20v20h-20z M40,80h15v15h-15z M70,50h10v20h-10z M50,70h10v10h-10z"
                  fill="currentColor"
                />
                <rect x="42" y="42" width="16" height="16" fill="#CCFF00" rx="3" />
                <path d="M47,46h6v8h-6z" fill="#000" />
              </svg>
            </div>

            <div>
              <p className="text-xs font-black text-text-primary uppercase tracking-wider">
                {isAr ? 'ارفع بياناتك' : 'ReLift Profile Sync'}
              </p>
              <p className="text-[10px] text-text-secondary mt-1 uppercase tracking-wide leading-relaxed">
                {isAr
                  ? 'دع أصدقاءك يمسحون هذا الرمز لعرض سجل تمارينك وتقدمك.'
                  : 'Let your workout circle scan this QR to view your volume and body progress stats.'}
              </p>
            </div>

            <Button
              onClick={onClose}
              variant="primary"
              className="w-full text-xs font-black uppercase py-3"
            >
              {isAr ? 'حسناً' : 'Done'}
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
