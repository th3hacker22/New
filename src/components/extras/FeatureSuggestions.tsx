import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { X, MessageSquare, ThumbsUp, Plus, Check, Trophy, Sparkles, Send } from "lucide-react";
import { uid } from "@/utils/id";

interface FeatureSuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  author: string;
  votes: number;
  userVoted: boolean;
  comments: Comment[];
  status: "gathering_votes" | "planned" | "in_progress" | "completed";
  createdAt: string;
}

const INITIAL_SUGGESTIONS: Suggestion[] = [
  {
    id: "sug-1",
    title: "WearOS & Apple Watch Companion App",
    description: "Ability to log sets, view rest timers, and check off exercises directly from the watch screen without taking out the phone.",
    author: "Alex Lift",
    votes: 342,
    userVoted: false,
    comments: [
      { id: "c-1", author: "Coach Sam", text: "This is crucial! I hate carrying my phone on the gym floor.", createdAt: new Date().toISOString() }
    ],
    status: "in_progress",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "sug-2",
    title: "Siri & Google Assistant Shortcuts",
    description: "Launch workout session by saying 'Hey Siri, start leg day workout' or log sets via voice command during heavy reps.",
    author: "Ziad Iron",
    votes: 189,
    userVoted: false,
    comments: [],
    status: "planned",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: "sug-3",
    title: "Advanced Supersets & Giant Sets Planner",
    description: "Support chaining 3 or more exercises together in a giant set with detailed instructions and a unified rest timer between giant rounds.",
    author: "BeastMode2026",
    votes: 275,
    userVoted: true,
    comments: [],
    status: "gathering_votes",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "sug-4",
    title: "Plate Load Auto-Calculator inside Workout Sessions",
    description: "Automatically show what plate stack configuration is needed for the target set directly in the workout logger interface.",
    author: "BarbellPrince",
    votes: 412,
    userVoted: false,
    comments: [],
    status: "completed",
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
];

export default function FeatureSuggestions({ isOpen, onClose }: FeatureSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  
  // Comments state
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");

  // Load from local storage or pre-populate
  useEffect(() => {
    const saved = localStorage.getItem("pulse_feature_suggestions");
    if (saved) {
      try {
        setSuggestions(JSON.parse(saved));
      } catch (e) {
        setSuggestions(INITIAL_SUGGESTIONS);
      }
    } else {
      setSuggestions(INITIAL_SUGGESTIONS);
      localStorage.setItem("pulse_feature_suggestions", JSON.stringify(INITIAL_SUGGESTIONS));
    }
  }, []);

  const saveSuggestions = (list: Suggestion[]) => {
    setSuggestions(list);
    localStorage.setItem("pulse_feature_suggestions", JSON.stringify(list));
  };

  // Handle upvote with toggle animation
  const handleVote = (id: string) => {
    const updated = suggestions.map((s) => {
      if (s.id === id) {
        const userVoted = !s.userVoted;
        return {
          ...s,
          userVoted,
          votes: userVoted ? s.votes + 1 : s.votes - 1,
        };
      }
      return s;
    });
    saveSuggestions(updated);
    
    // update current selected suggestion if comments are open
    if (selectedSuggestion?.id === id) {
      const match = updated.find(s => s.id === id);
      if (match) setSelectedSuggestion(match);
    }
  };

  // Submit feature request
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    const request: Suggestion = {
      id: uid(),
      title: newTitle,
      description: newDesc,
      author: newAuthor.trim() || "Anonymous Athlete",
      votes: 1,
      userVoted: true,
      comments: [],
      status: "gathering_votes",
      createdAt: new Date().toISOString(),
    };

    const updated = [request, ...suggestions];
    saveSuggestions(updated);

    // reset fields
    setNewTitle("");
    setNewDesc("");
    setNewAuthor("");
    setShowAddForm(false);
  };

  // Add Comment
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText || !selectedSuggestion) return;

    const comment: Comment = {
      id: uid(),
      author: commentAuthor.trim() || "Anonymous Lift",
      text: commentText,
      createdAt: new Date().toISOString(),
    };

    const updated = suggestions.map((s) => {
      if (s.id === selectedSuggestion.id) {
        const newComments = [...s.comments, comment];
        return { ...s, comments: newComments };
      }
      return s;
    });

    saveSuggestions(updated);

    // update modal view
    const match = updated.find(s => s.id === selectedSuggestion.id);
    if (match) setSelectedSuggestion(match);

    setCommentText("");
    setCommentAuthor("");
  };

  const getStatusBadge = (status: Suggestion["status"]) => {
    switch (status) {
      case "completed":
        return <span className="bg-success/20 text-success border border-success/30 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider">Completed 🏆</span>;
      case "in_progress":
        return <span className="bg-primary/20 text-primary border border-primary/30 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider">In Progress ⚡</span>;
      case "planned":
        return <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider">Planned 📅</span>;
      default:
        return <span className="bg-bg-surface-hover text-text-secondary border border-border rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider">Voting Open 🗳️</span>;
    }
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
            className="relative w-full max-w-xl rounded-2xl border border-border bg-bg-surface-hover p-6 shadow-2xl overflow-y-auto max-h-[85vh] no-scrollbar flex flex-col gap-5"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Feature Suggestions & Voting
                  </h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-wide">
                    Vote on upcoming ideas or submit your own request
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

            {/* List & Detail content split */}
            <div className="overflow-y-auto pr-1 flex-1 space-y-4 max-h-[500px] no-scrollbar">
              <AnimatePresence mode="wait">
                {selectedSuggestion ? (
                  /* Comments Detail view */
                  <motion.div
                    key="detail"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <button
                      onClick={() => setSelectedSuggestion(null)}
                      className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1.5"
                    >
                      ← Back to Suggestions
                    </button>

                    <div className="glass-card rounded-[--radius-card] p-5 border border-border">
                      <div className="flex justify-between items-start mb-2">
                        {getStatusBadge(selectedSuggestion.status)}
                        <span className="text-[9px] text-text-muted uppercase font-mono tracking-widest">
                          by {selectedSuggestion.author}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white tracking-wide">
                        {selectedSuggestion.title}
                      </h4>
                      <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                        {selectedSuggestion.description}
                      </p>

                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                        <button
                          onClick={() => handleVote(selectedSuggestion.id)}
                          className={`flex items-center gap-2 text-xs font-black px-3.5 py-1.5 rounded-xl border transition-all ${
                            selectedSuggestion.userVoted
                              ? "bg-primary text-zinc-950 border-primary"
                              : "bg-bg-surface-hover text-text-secondary border-border hover:text-white"
                          }`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>{selectedSuggestion.votes} Votes</span>
                        </button>
                        <span className="text-xs text-text-muted flex items-center gap-1.5 font-bold uppercase tracking-wider">
                          <MessageSquare className="h-4 w-4" />
                          {selectedSuggestion.comments.length} Comments
                        </span>
                      </div>
                    </div>

                    {/* Comments list */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                        Discussion ({selectedSuggestion.comments.length})
                      </h4>
                      
                      {selectedSuggestion.comments.length === 0 ? (
                        <p className="text-xs text-text-muted uppercase tracking-wider text-center py-4 bg-bg-surface-hover border border-dashed border-border rounded-xl">
                          No comments yet. Start the discussion below!
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {selectedSuggestion.comments.map((comment) => (
                            <div key={comment.id} className="p-3 bg-bg-surface-hover border border-border rounded-xl space-y-1">
                              <div className="flex justify-between text-[9px] text-text-muted font-bold uppercase font-mono tracking-wider">
                                <span>{comment.author}</span>
                                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs text-text-primary">
                                {comment.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="space-y-3 bg-bg-surface-hover p-4 border border-border rounded-2xl">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-white">
                        Write Comment
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Your Name (e.g. Max Lift)"
                          value={commentAuthor}
                          onChange={(e) => setCommentAuthor(e.target.value)}
                          className="w-full text-xs rounded-lg border border-border bg-bg-surface-hover px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-primary transition-all"
                        />
                        <button
                          type="submit"
                          disabled={!commentText}
                          className="bg-primary hover:bg-primary-hover text-zinc-950 text-xs font-black uppercase tracking-wider rounded-lg px-4 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <Send className="h-3 w-3" />
                          Comment
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Share your thoughts about this feature suggestion..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        required
                        className="w-full text-xs rounded-lg border border-border bg-bg-surface-hover px-3 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-primary transition-all"
                      />
                    </form>
                  </motion.div>
                ) : showAddForm ? (
                  /* Create suggestion view */
                  <motion.form
                    key="add-form"
                    onSubmit={handleAddSubmit}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-text-secondary">
                        Propose New Feature
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="text-[10px] font-black uppercase text-text-muted hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-[9px] font-black uppercase tracking-wider text-text-muted">
                          Feature Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sync nutrition with Apple Health"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          required
                          className="w-full text-xs rounded-xl border border-border bg-bg-surface-hover px-3 py-2.5 text-white outline-none focus:border-primary transition-all font-bold"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[9px] font-black uppercase tracking-wider text-text-muted">
                          Your Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. IronBuilder26"
                          value={newAuthor}
                          onChange={(e) => setNewAuthor(e.target.value)}
                          className="w-full text-xs rounded-xl border border-border bg-bg-surface-hover px-3 py-2.5 text-white outline-none focus:border-primary transition-all font-bold"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[9px] font-black uppercase tracking-wider text-text-muted">
                          Details & Use-case description
                        </label>
                        <textarea
                          placeholder="Explain exactly how this feature should work, what problem it solves, and why other gym-goers will love it..."
                          rows={4}
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          required
                          className="w-full text-xs rounded-xl border border-border bg-bg-surface-hover px-3 py-2.5 text-white outline-none focus:border-primary transition-all leading-relaxed"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full py-4 text-xs font-black uppercase tracking-wider mt-2"
                    >
                      <Plus className="h-4 w-4" /> Submit Suggestion
                    </Button>
                  </motion.form>
                ) : (
                  /* Standard List view */
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-text-secondary">
                        Community Requests ({suggestions.length})
                      </span>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="text-xs font-black uppercase text-primary flex items-center gap-1 hover:underline"
                      >
                        <Plus className="h-3.5 w-3.5" /> Suggest Feature
                      </button>
                    </div>

                    <div className="space-y-3">
                      {suggestions.map((sug) => (
                        <div
                          key={sug.id}
                          className="flex gap-4 p-4 border border-border rounded-2xl bg-bg-surface-hover items-center justify-between hover:border-border transition-colors"
                        >
                          {/* Left: Voting Block */}
                          <button
                            onClick={() => handleVote(sug.id)}
                            className={`flex flex-col items-center justify-center shrink-0 w-12 h-14 rounded-xl border transition-all ${
                              sug.userVoted
                                ? "bg-primary border-primary text-zinc-950"
                                : "bg-bg-surface-hover border-border text-text-secondary hover:text-white hover:border-border"
                            }`}
                          >
                            <ThumbsUp className="h-4 w-4 mb-1" />
                            <span className="text-xs font-mono font-black">{sug.votes}</span>
                          </button>

                          {/* Center: Info */}
                          <div
                            onClick={() => setSelectedSuggestion(sug)}
                            className="flex-1 min-w-0 cursor-pointer text-left"
                          >
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              {getStatusBadge(sug.status)}
                              <span className="text-[8px] text-text-muted uppercase tracking-widest font-mono">
                                by {sug.author}
                              </span>
                            </div>
                            <h4 className="text-xs font-black text-white hover:text-primary transition-colors truncate">
                              {sug.title}
                            </h4>
                            <p className="text-[11px] text-text-secondary line-clamp-1 mt-0.5 leading-relaxed">
                              {sug.description}
                            </p>
                          </div>

                          {/* Right: Comments Indicator */}
                          <button
                            onClick={() => setSelectedSuggestion(sug)}
                            className="flex flex-col items-center justify-center p-2 rounded-xl text-text-muted hover:text-white transition-colors gap-1.5 shrink-0"
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-[9px] font-black tracking-wider">{sug.comments.length}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer buttons */}
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
