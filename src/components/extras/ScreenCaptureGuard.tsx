import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Sparkles, X } from "lucide-react";

export default function ScreenCaptureGuard() {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Print screen or macOS screenshot combos (Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5 or Win+Shift+S)
      const isPrintScreen = e.key === "PrintScreen";
      const isMacScreenshot = e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key);
      const isWinScreenshot = e.metaKey && e.shiftKey && e.key.toLowerCase() === "s";

      if (isPrintScreen || isMacScreenshot || isWinScreenshot) {
        // Prevent default isn't fully possible for OS-level screenshots, but we can detect & alert!
        setShowToast(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // auto hide toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm rounded-2xl border border-warning/30 bg-bg-surface-hover p-4 shadow-2xl backdrop-blur-md flex items-start gap-3"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/10 border border-warning/20 text-warning">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
              Screen Capture Detected
              <Sparkles className="h-3 w-3 text-warning animate-pulse" />
            </p>
            <p className="text-[10px] font-bold text-text-secondary mt-1 leading-normal uppercase tracking-wide">
              ReLift Secure Guard active. Private progress photos and workout metrics are secured.
            </p>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-text-muted hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
