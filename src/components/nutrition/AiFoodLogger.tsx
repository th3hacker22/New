import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, PlusCircle, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import aiFoodScannerImg from '@/assets/images/ai_food_scanner_illustration_1784776039871.jpg';

interface AiResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface AiFoodLoggerProps {
  labels: Record<string, string>;
  isAr: boolean;
  onScanClick: () => void;
  onAdd: (result: AiResult) => void;
}

export function AiFoodLogger({ labels, isAr, onScanClick, onAdd }: AiFoodLoggerProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/parse-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt, mealTypeHint: 'snack' }),
      });
      if (!res.ok) throw new Error('AI failed');
      setResult(await res.json());
    } catch {
      setError('Failed to analyze meal. Check GEMINI_API_KEY.');
    } finally {
      setLoading(false);
    }
  };

  const addResult = () => {
    if (!result) return;
    onAdd(result);
    setPrompt('');
    setResult(null);
  };

  return (
    <div className="glass-card overflow-hidden rounded-3xl border border-primary/20 shadow-lg shadow-primary/5 p-6 flex flex-col gap-4 relative">
      <div className="absolute right-0 top-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2">
          <span className="rounded-lg bg-primary/20 p-1.5 text-primary">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </span>
          <span>{labels.aiLogger}</span>
        </h2>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase text-primary">
          Gemini
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-8">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={labels.aiPlaceholder}
            className="w-full min-h-[105px] rounded-2xl border border-border bg-bg/50 p-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none transition-all h-full"
          />
        </div>
        <div className="md:col-span-4 hidden md:flex flex-col items-center justify-center rounded-2xl border border-primary/20 p-5 relative overflow-hidden min-h-[160px]">
          <img
            src={aiFoodScannerImg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
            referrerPolicy="no-referrer"
          />
          <motion.div
            className="absolute inset-x-0 h-[2px] bg-primary shadow-[0_0_12px_#ccff00] z-20 pointer-events-none"
            animate={{ top: ['10%', '90%', '10%'] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          />
          <span className="relative z-20 text-[10px] font-black uppercase tracking-widest text-primary bg-black/60 px-2.5 py-1 rounded backdrop-blur border border-primary/20 mt-auto">
            {isAr ? 'المسح الذكي' : 'AI SENSORY SCAN'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        {error && (
          <div className="flex items-center gap-1.5 text-xs text-danger font-semibold bg-danger/5 px-3 py-1.5 rounded-lg border border-danger/10">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex-1" />
        <div className="flex gap-2">
          <Button
            onClick={onScanClick}
            variant="outline"
            className="px-4 font-black uppercase text-[10px] border-secondary/40"
            icon={<PlusCircle className="h-4 w-4 text-secondary" />}
          >
            {labels.scanMeal}
          </Button>
          <Button
            onClick={analyze}
            disabled={loading || !prompt.trim()}
            variant="outline"
            className="px-5 font-black uppercase text-xs border-primary/40"
            icon={
              loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Sparkles className="h-4 w-4 text-primary" />
              )
            }
          >
            {loading ? labels.aiAnalyzing : labels.aiAnalyze}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-primary/30 bg-primary-dim/10 p-4"
          >
            <div className="text-xs font-bold text-primary uppercase mb-2 flex items-center gap-1.5">
              <Check className="h-4 w-4" />
              <span>{labels.aiResults}</span>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-black text-text-primary">{result.name}</h4>
                <p className="text-[10px] text-text-muted mt-0.5">
                  {labels.suggestedMeal}:{' '}
                  <span className="font-bold uppercase text-primary">
                    {labels[result.mealType] || result.mealType}
                  </span>
                </p>
              </div>
              <span className="rounded-xl bg-primary/20 px-3 py-1 text-sm font-black text-primary">
                {result.calories} kcal
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mt-3">
              {(['protein', 'carbs', 'fat'] as const).map((k) => (
                <div key={k} className="rounded-lg bg-bg/50 p-2 border border-border/30">
                  <div className="text-[9px] font-bold text-text-muted uppercase">{labels[k]}</div>
                  <div className="text-sm font-black text-text-secondary">{result[k]}g</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-2 text-xs font-bold uppercase rounded-xl bg-border/20 text-text-muted hover:bg-border/30"
              >
                {labels.aiReject}
              </button>
              <Button
                onClick={addResult}
                variant="primary"
                className="flex-1 py-2 text-xs font-black uppercase"
              >
                {labels.aiAdd}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
