import { storage } from "@/lib/storage";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  X,
  MessageSquare,
  Bug,
  Send,
  Upload,
  Sparkles,
  User,
  Cpu,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { uid } from "@/utils/id";

interface SupportAndBotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  createdAt: string;
}

interface BugReport {
  id: string;
  category: string;
  description: string;
  screenshotUrl?: string;
  createdAt: string;
  status: "open" | "reviewed" | "fixed";
}

const SUGGESTION_CHIPS = [
  "How can I improve my deadlift form?",
  "Calculate plate load for 145kg squat?",
  "How does Muscle Recovery scoring work?",
  "My workout didn't save, what should I do?",
];

export default function SupportAndBot({ isOpen, onClose }: SupportAndBotProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "bug">("chat");

  // ── AI Chat States ──
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-welcome",
      role: "bot",
      text: "👋 Welcome to ReLift Gym Support! I am **ReLift AI Coach & Assistant**.\n\nAsk me any fitness questions (e.g. nutrition, workout advice, form tips) or ask for help using the app! How can I help you crush your session today? ⚡",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Bug Report States ──
  const [bugCategory, setBugCategory] = useState("Logger Crash");
  const [bugDesc, setBugDesc] = useState("");
  const [bugFile, setBugFile] = useState<File | null>(null);
  const [bugFilePreview, setBugFilePreview] = useState<string | null>(null);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [reportSuccess, setReportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load bug reports from localStorage
  useEffect(() => {
    const saved = storage.getString("pulse_bug_reports" as any, "");
    if (saved) {
      try {
        setBugReports(JSON.parse(saved));
      } catch (e) {
        setBugReports([]);
      }
    }
  }, []);

  // Save bug reports
  const saveBugReports = (list: BugReport[]) => {
    setBugReports(list);
    storage.set("pulse_bug_reports" as any, JSON.stringify(list as any));
  };

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (bugFilePreview) URL.revokeObjectURL(bugFilePreview);
    };
  }, [bugFilePreview]);

  // Handle Send Chat
  const handleSendChat = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: uid(),
      role: "user",
      text: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      // Build history payload for Gemini support chat
      const historyPayload = messages.slice(1).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        text: m.text,
      }));

      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
      });

      if (!res.ok) throw new Error("Server error, offline support simulation triggered.");

      const data = await res.json();
      
      const botMsg: Message = {
        id: uid(),
        role: "bot",
        text: data.reply || "I am here to support your fitness journey!",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      // Mock / Offline response fallback
      setTimeout(() => {
        const fallbackMsg: Message = {
          id: uid(),
          role: "bot",
          text: `⚠️ **[Simulation Mode Active]**\n\nI received your query: *"${textToSend}"*.\n\nSince local secrets might not be bound yet in the preview workspace, I am running in local backup mode! \n\n* **Squat Form Tip:** Keep your chest upright, hinge at your hips, and squat past parallel while driving through your heels.\n* **Bar Calculator Tip:** Standard barbell is 20kg. Use the plate calculator in settings to quickly find standard red (25kg) and blue (20kg) combinations!`,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  // Screenshot input handler
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (bugFilePreview) URL.revokeObjectURL(bugFilePreview);

    setBugFile(file);
    setBugFilePreview(URL.createObjectURL(file));
  };

  // Submit Bug Report
  const handleBugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugDesc) return;

    const newReport: BugReport = {
      id: uid(),
      category: bugCategory,
      description: bugDesc,
      screenshotUrl: bugFilePreview || undefined,
      createdAt: new Date().toISOString(),
      status: "open",
    };

    const updated = [newReport, ...bugReports];
    saveBugReports(updated);

    setReportSuccess(true);
    setBugDesc("");
    setBugFile(null);
    setBugFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setTimeout(() => {
      setReportSuccess(false);
    }, 4000);
  };

  // Delete bug report log
  const handleDeleteReport = (id: string) => {
    const updated = bugReports.filter((r) => r.id !== id);
    saveBugReports(updated);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-xl rounded-2xl border border-border bg-bg-surface-hover p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Help & AI Support Assistant
                  </h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-wide">
                    Talk with AI Gym Coach or Submit technical bug reports
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-surface-hover border border-border text-text-secondary hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Toggle tabs */}
            <div className="flex border-b border-border p-1 bg-bg-surface-hover rounded-xl my-4 shrink-0">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === "chat"
                    ? "bg-bg-surface-hover text-primary shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                AI Support Coach
              </button>
              <button
                onClick={() => setActiveTab("bug")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === "bug"
                    ? "bg-bg-surface-hover text-red-500 shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Bug className="h-3.5 w-3.5" />
                Report a Bug
              </button>
            </div>

            {/* Tab contents wrapper */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 no-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === "chat" ? (
                  /* AI Chat Thread */
                  <motion.div
                    key="chat-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col h-full justify-between gap-4"
                  >
                    {/* Chat log scroll window */}
                    <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px] pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                      {messages.map((m) => {
                        const isBot = m.role === "bot";
                        return (
                          <div
                            key={m.id}
                            className={`flex gap-3 max-w-[85%] ${
                              isBot ? "mr-auto" : "ml-auto flex-row-reverse"
                            }`}
                          >
                            <div
                              className={`h-7 w-7 rounded-lg flex items-center justify-center border shrink-0 text-xs font-black uppercase ${
                                isBot
                                  ? "bg-primary/15 text-primary border-primary/20"
                                  : "bg-bg-surface-hover text-white border-border"
                              }`}
                            >
                              {isBot ? <Cpu className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                            </div>
                            <div
                              className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed border ${
                                isBot
                                  ? "bg-bg-surface-hover border-border text-text-primary"
                                  : "bg-primary text-zinc-950 border-primary font-bold"
                              }`}
                              style={{ whiteSpace: "pre-wrap" }}
                            >
                              {m.text}
                            </div>
                          </div>
                        );
                      })}

                      {isTyping && (
                        <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                          <div className="h-7 w-7 rounded-lg flex items-center justify-center border shrink-0 bg-primary/15 text-primary border-primary/20">
                            <Cpu className="h-3.5 w-3.5" />
                          </div>
                          <div className="rounded-2xl px-4 py-2.5 bg-bg-surface-hover border border-border text-text-muted text-xs animate-pulse">
                            Coach is thinking... ⚡
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chips & Text box block */}
                    <div className="shrink-0 space-y-3">
                      {/* Suggestion Chips */}
                      {messages.length === 1 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {SUGGESTION_CHIPS.map((chip, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendChat(chip)}
                              className="text-[10px] font-bold text-text-secondary hover:text-primary hover:border-primary/40 bg-bg-surface-hover border border-border rounded-lg px-2.5 py-1.5 transition-all text-left"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Text Input area */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendChat(inputText)}
                          placeholder="Ask AI Coach for advice or help with ReLift app..."
                          className="flex-1 rounded-xl border border-border bg-bg-surface-hover px-4 py-3 text-xs font-bold text-white outline-none focus:border-primary transition-all"
                        />
                        <button
                          onClick={() => handleSendChat(inputText)}
                          disabled={!inputText.trim()}
                          className="h-11 w-11 shrink-0 bg-primary hover:bg-primary-hover text-zinc-950 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Bug Report Tab */
                  <motion.div
                    key="bug-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <AnimatePresence>
                      {reportSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="rounded-xl border border-success/40 bg-success/10 p-3 flex items-start gap-2.5 text-xs text-success font-bold uppercase tracking-wider"
                        >
                          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                          <div>
                            <p>Bug report successfully logged!</p>
                            <p className="text-[10px] font-medium text-text-secondary mt-0.5 normal-case">
                              Apologies for the friction. Our core engineering team has been notified.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleBugSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-text-secondary">
                            Problem Category
                          </label>
                          <select
                            value={bugCategory}
                            onChange={(e) => setBugCategory(e.target.value)}
                            className="w-full text-xs font-bold rounded-xl border border-border bg-bg-surface-hover px-3 py-2.5 text-white outline-none"
                          >
                            <option value="Logger Crash">Logger Crash 💥</option>
                            <option value="Timer Issue">Timer Issue ⏱️</option>
                            <option value="Nutrition Parser Error">Nutrition Parser Error 🥗</option>
                            <option value="Layout/Visual UI Glitch">Layout/Visual UI Glitch 🎨</option>
                            <option value="Other">Other 🔧</option>
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-text-secondary">
                            Screenshot (Optional)
                          </label>
                          <label className="w-full flex items-center justify-center gap-1.5 text-xs font-black uppercase text-text-secondary border border-border bg-bg-surface-hover hover:bg-bg-surface-hover rounded-xl px-3 py-2.5 cursor-pointer transition-colors">
                            <Upload className="h-4 w-4 text-primary" />
                            <span>{bugFile ? "Change Image" : "Attach File"}</span>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleScreenshotChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Screenshot preview */}
                      {bugFilePreview && (
                        <div className="relative border border-border rounded-xl bg-bg-surface-hover p-2 flex items-center gap-3">
                          <img
                            src={bugFilePreview}
                            alt="Screenshot attachment preview"
                            className="h-14 w-14 object-cover rounded-lg border border-border bg-bg-surface-hover"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate max-w-[200px]">
                              {bugFile?.name}
                            </p>
                            <p className="text-[10px] text-text-muted font-mono">
                              {(bugFile ? bugFile.size / 1024 : 0).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setBugFile(null);
                              setBugFilePreview(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-text-secondary">
                          Description of the bug
                        </label>
                        <textarea
                          rows={3}
                          value={bugDesc}
                          onChange={(e) => setBugDesc(e.target.value)}
                          required
                          placeholder="Describe exactly what happened, and list any steps to reproduce the issue..."
                          className="w-full text-xs rounded-xl border border-border bg-bg-surface-hover px-3 py-2.5 text-white outline-none focus:border-primary transition-all leading-relaxed"
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="danger"
                        className="w-full py-4 text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white"
                      >
                        <Bug className="h-4 w-4" /> Log Bug Report
                      </Button>
                    </form>

                    {/* Historic logs list */}
                    {bugReports.length > 0 && (
                      <div className="pt-4 border-t border-border space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                          Logged Bug Tickets ({bugReports.length})
                        </h4>
                        <div className="space-y-2 max-h-[140px] overflow-y-auto no-scrollbar">
                          {bugReports.map((report) => (
                            <div
                              key={report.id}
                              className="p-3 border border-border bg-bg-surface-hover rounded-xl flex items-center justify-between text-xs gap-3"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-full px-2 py-0.5 text-[8px] font-black uppercase">
                                    {report.category}
                                  </span>
                                  <span className="text-[8px] text-text-muted uppercase font-mono">
                                    {new Date(report.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-text-primary font-medium truncate max-w-[280px]">
                                  {report.description}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteReport(report.id)}
                                className="h-7 w-7 rounded-lg text-text-muted hover:text-red-500 transition-colors flex items-center justify-center shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Buttons */}
            <div className="border-t border-border pt-4 shrink-0 flex justify-end">
              <Button
                onClick={onClose}
                variant="ghost"
                className="text-xs font-black uppercase tracking-wider py-2"
              >
                Close Window
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
