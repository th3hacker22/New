import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  Smile,
  BarChart2,
  MapPin,
  Image as ImageIcon,
  X,
  Hash,
  Send,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { WorkoutSession } from '@/db';
import { formatDuration, formatVolume } from './feedUtils';

export interface ComposerLabels {
  postPlaceholder: string;
  photo: string;
  attachWorkout: string;
  feelingLabel: string;
  pollLabel: string;
  locationLabel: string;
  postButton: string;
  posting: string;
  publicAudience: string;
  followersAudience: string;
  privateAudience: string;
  exercisesCount: string;
  attached: string;
  pollAttachment: string;
  howFeeling: string;
  selectWorkout: string;
  noWorkouts: string;
  select: string;
  addLocation: string;
  locationPlaceholder: string;
  presetLocations: string[];
  setLocation: string;
  createPoll: string;
  question: string;
  questionPlaceholder: string;
  options: string;
  option1: string;
  option2: string;
  option3: string;
  attachPoll: string;
}

export interface ComposerWorkout {
  title: string;
  duration: number;
  volume: number;
  exercisesCount: number;
  exercises?: unknown[];
}

interface PostComposerProps {
  user: User;
  isAr: boolean;
  labels: ComposerLabels;
  recentSessions: WorkoutSession[];
  isPosting: boolean;
  editingId: string | null;
  onSubmit: (data: {
    content: string;
    images: File[];
    feeling: FeelingType | null;
    location: string;
    privacy: Privacy;
    workout: ComposerWorkout | null;
    poll: { question: string; options: string[] } | null;
    hashtags: string[];
  }) => Promise<void> | void;
  onCancelEdit: () => void;
  initialContent?: string;
  popularHashtags: string[];
  feelings: FeelingType[];
}

export type Privacy = 'public' | 'followers' | 'private';
export interface FeelingType {
  id: string;
  emoji: string;
  textEn: string;
  textAr: string;
}

export function PostComposer({
  user,
  isAr,
  labels,
  recentSessions,
  isPosting,
  editingId,
  onSubmit,
  onCancelEdit,
  initialContent = '',
  popularHashtags,
  feelings,
}: PostComposerProps) {
  const [content, setContent] = useState(initialContent);
  const [images, setImages] = useState<File[]>([]);
  const [feeling, setFeeling] = useState<FeelingType | null>(null);
  const [location, setLocation] = useState('');
  const [privacy, setPrivacy] = useState<Privacy>('public');
  const [workout, setWorkout] = useState<ComposerWorkout | null>(null);
  const [poll, setPoll] = useState<{ question: string; options: string[] } | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);

  const [showFeeling, setShowFeeling] = useState(false);
  const [showWorkout, setShowWorkout] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [pollQ, setPollQ] = useState('');
  const [poll1, setPoll1] = useState('');
  const [poll2, setPoll2] = useState('');
  const [poll3, setPoll3] = useState('');

  const canPost = content.trim() || images.length > 0 || workout || poll;

  const reset = () => {
    setContent('');
    setImages([]);
    setFeeling(null);
    setLocation('');
    setWorkout(null);
    setPoll(null);
    setHashtags([]);
  };

  return (
    <div className="glass-card rounded-[2.2rem] p-5 border border-primary/20 shadow-2xl bg-gradient-to-br from-bg-card via-bg-surface/50 to-bg-card space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-3">
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              className="w-10 h-10 rounded-full border border-primary/30 shadow-md object-cover"
              alt=""
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs border border-primary/30 shadow-md">
              {user.displayName?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xs font-black text-text-primary">
              {user.displayName || 'Athlete'}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              {feeling && (
                <Badge color="primary" onRemove={() => setFeeling(null)}>
                  <span>{feeling.emoji}</span>
                  <span>{isAr ? feeling.textAr : feeling.textEn}</span>
                </Badge>
              )}
              {location && (
                <Badge color="blue" onRemove={() => setLocation('')}>
                  <MapPin className="h-3 w-3" />
                  <span>{location}</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
        <select
          value={privacy}
          onChange={(e) => setPrivacy(e.target.value as Privacy)}
          className="text-[10px] font-black bg-bg-surface-hover text-text-muted border border-border/60 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value="public">{labels.publicAudience}</option>
          <option value="followers">{labels.followersAudience}</option>
          <option value="private">{labels.privateAudience}</option>
        </select>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={labels.postPlaceholder}
        className="w-full bg-transparent border-none resize-none text-sm focus:ring-0 placeholder:text-text-muted/60 min-h-[80px] leading-relaxed"
      />

      {/* Emojis */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 border-y border-border/20">
        {['💪', '🔥', '🏆', '⚡', '🏋️‍♂️', '🎯', '🥗', '🥇', '💥', '👏', '💯', '🧘'].map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => setContent((p) => p + ' ' + emoji)}
            className="p-1.5 rounded-lg bg-bg-surface-hover/60 hover:bg-primary/20 transition-all text-xs shrink-0 active:scale-90"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Hashtags */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <Hash className="h-3.5 w-3.5 text-text-muted shrink-0" />
        {popularHashtags.map((tag) => {
          const selected = hashtags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() =>
                setHashtags(selected ? hashtags.filter((x) => x !== tag) : [...hashtags, tag])
              }
              className={cn(
                'px-2 py-0.5 rounded-md text-[10px] font-bold transition-all shrink-0 border',
                selected
                  ? 'bg-primary text-primary-text border-primary font-black'
                  : 'bg-bg-surface-hover text-text-muted border-border/40 hover:text-text-primary',
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
          {images.map((file, i) => (
            <div
              key={i}
              className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border shadow-md shrink-0 group"
            >
              <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
              <button
                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white hover:bg-danger"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {workout && (
        <div className="relative p-3.5 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-text-primary uppercase tracking-wide">
                  {workout.title}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-text">
                  {labels.attached}
                </span>
              </div>
              <div className="text-[10px] font-bold text-text-muted flex gap-3 mt-0.5">
                <span>⏱️ {formatDuration(workout.duration, isAr)}</span>
                <span>💪 {formatVolume(workout.volume, isAr)}</span>
                <span>
                  📋 {workout.exercisesCount} {labels.exercisesCount}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWorkout(null)}
            className="p-1.5 rounded-lg bg-black/40 text-text-muted hover:text-danger"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {poll && (
        <div className="relative p-3.5 rounded-2xl bg-bg-surface-hover/80 border border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-black text-xs">
              <BarChart2 className="h-4 w-4" />
              <span>{labels.pollAttachment}</span>
            </div>
            <button
              type="button"
              onClick={() => setPoll(null)}
              className="p-1 rounded-lg hover:bg-danger/20 hover:text-danger text-text-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs font-bold text-text-primary">{poll.question}</p>
          <div className="space-y-1">
            {poll.options.map((opt, i) => (
              <div
                key={i}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-bg-surface text-text-secondary border border-border/30"
              >
                {i + 1}. {opt}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between pt-3 border-t border-border/30 flex-wrap gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          <ToolbarButton
            onClick={() => {}}
            icon={<ImageIcon className="h-4 w-4 text-emerald-400" />}
            label={labels.photo}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files && setImages((p) => [...p, ...Array.from(e.target.files!)])
              }
            />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setShowWorkout(true)}
            icon={<Dumbbell className="h-4 w-4 text-primary" />}
            label={labels.attachWorkout}
          />
          <ToolbarButton
            onClick={() => setShowFeeling(true)}
            icon={<Smile className="h-4 w-4 text-amber-400" />}
            label={labels.feelingLabel}
          />
          <ToolbarButton
            onClick={() => setShowPoll(true)}
            icon={<BarChart2 className="h-4 w-4 text-purple-400" />}
            label={labels.pollLabel}
          />
          <ToolbarButton
            onClick={() => setShowLocation(true)}
            icon={<MapPin className="h-4 w-4 text-rose-400" />}
            label={labels.locationLabel}
          />
        </div>
        <div className="flex gap-2">
          {editingId && (
            <Button
              variant="outline"
              onClick={onCancelEdit}
              className="rounded-xl px-4 py-2 text-xs font-black uppercase"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={async () => {
              await onSubmit({
                content,
                images,
                feeling,
                location,
                privacy,
                workout,
                poll,
                hashtags,
              });
              reset();
            }}
            disabled={isPosting || !canPost}
            className="rounded-xl px-5 py-2 text-xs font-black uppercase tracking-widest bg-primary text-black hover:shadow-glow-primary transition-all shadow-md"
          >
            {isPosting ? labels.posting : labels.postButton}
          </Button>
        </div>
      </div>

      {/* Modals */}
      <FeelingModal
        open={showFeeling}
        onClose={() => setShowFeeling(false)}
        feelings={feelings}
        isAr={isAr}
        title={labels.howFeeling}
        onPick={(f) => {
          setFeeling(f);
          setShowFeeling(false);
        }}
      />
      <WorkoutModal
        open={showWorkout}
        onClose={() => setShowWorkout(false)}
        sessions={recentSessions}
        isAr={isAr}
        title={labels.selectWorkout}
        empty={labels.noWorkouts}
        selectLabel={labels.select}
        exercisesLabel={labels.exercisesCount}
        onPick={(w) => {
          setWorkout(w);
          setShowWorkout(false);
        }}
      />
      <LocationModal
        open={showLocation}
        onClose={() => setShowLocation(false)}
        isAr={isAr}
        title={labels.addLocation}
        placeholder={labels.locationPlaceholder}
        presets={labels.presetLocations}
        saveLabel={labels.setLocation}
        value={customLocation}
        onChange={setCustomLocation}
        onPick={(loc) => {
          setLocation(loc);
          setShowLocation(false);
          setCustomLocation('');
        }}
      />
      <PollModal
        open={showPoll}
        onClose={() => setShowPoll(false)}
        isAr={isAr}
        title={labels.createPoll}
        qLabel={labels.question}
        qPlaceholder={labels.questionPlaceholder}
        optLabel={labels.options}
        opt1={labels.option1}
        opt2={labels.option2}
        opt3={labels.option3}
        attachLabel={labels.attachPoll}
        q={pollQ}
        setQ={setPollQ}
        o1={poll1}
        setO1={setPoll1}
        o2={poll2}
        setO2={setPoll2}
        o3={poll3}
        setO3={setPoll3}
        onAttach={() => {
          const opts = [poll1.trim(), poll2.trim()];
          if (poll3.trim()) opts.push(poll3.trim());
          setPoll({ question: pollQ.trim(), options: opts });
          setShowPoll(false);
        }}
      />
    </div>
  );
}

function Badge({
  children,
  color,
  onRemove,
}: {
  children: React.ReactNode;
  color: 'primary' | 'blue';
  onRemove: () => void;
}) {
  return (
    <span
      className={cn(
        'text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border',
        color === 'primary'
          ? 'bg-primary/10 text-primary border-primary/20'
          : 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      )}
    >
      {children}
      <X className="h-3 w-3 cursor-pointer hover:opacity-80" onClick={onRemove} />
    </span>
  );
}

function ToolbarButton({
  onClick,
  icon,
  label,
  children,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <label className="cursor-pointer px-2.5 py-1.5 rounded-xl bg-bg-surface-hover hover:bg-primary/10 hover:text-primary transition-all text-text-muted text-xs font-bold flex items-center gap-1.5 border border-border/30">
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {children}
    </label>
  );
}

function Modal({
  open,
  onClose,
  children,
  title,
  icon,
  maxWidth = 'max-w-sm',
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              'w-full rounded-3xl bg-bg-card p-5 border border-border/80 shadow-2xl space-y-4',
              maxWidth,
            )}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2 text-primary font-black text-sm">
                {icon}
                {title}
              </div>
              <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FeelingModal({
  open,
  onClose,
  feelings,
  isAr,
  title,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  feelings: FeelingType[];
  isAr: boolean;
  title: string;
  onPick: (f: FeelingType) => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      icon={<Smile className="h-5 w-5 text-amber-400" />}
    >
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto no-scrollbar">
        {feelings.map((item) => (
          <button
            key={item.id}
            onClick={() => onPick(item)}
            className="p-3 rounded-2xl bg-bg-surface-hover hover:bg-primary/20 hover:border-primary/40 border border-border/40 transition-all flex items-center gap-2.5 text-left"
          >
            <span className="text-xl">{item.emoji}</span>
            <span className="text-xs font-bold text-text-primary">
              {isAr ? item.textAr : item.textEn}
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

function WorkoutModal({
  open,
  onClose,
  sessions,
  isAr,
  title,
  empty,
  selectLabel,
  exercisesLabel,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  sessions: WorkoutSession[];
  isAr: boolean;
  title: string;
  empty: string;
  selectLabel: string;
  exercisesLabel: string;
  onPick: (w: ComposerWorkout) => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      icon={<Dumbbell className="h-5 w-5 text-primary" />}
      maxWidth="max-w-md"
    >
      <div className="overflow-y-auto space-y-3 max-h-[60vh] pr-1 no-scrollbar">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-text-muted space-y-2">
            <Dumbbell className="h-8 w-8 mx-auto text-text-muted/40" />
            <p className="text-xs font-bold">{empty}</p>
          </div>
        ) : (
          sessions.map((s) => {
            const totalVol = s.exercises.reduce(
              (acc, ex) =>
                acc +
                ex.sets.reduce((a, set) => a + (set.completed ? set.weight * set.reps : 0), 0),
              0,
            );
            return (
              <div
                key={s.id}
                onClick={() =>
                  onPick({
                    title: s.name,
                    duration: s.duration,
                    volume: totalVol,
                    exercisesCount: s.exercises.length,
                    exercises: s.exercises.map((ex) => ({
                      exerciseId: String(ex.exerciseId),
                      exerciseName: ex.exerciseName,
                      setsCount: ex.sets.length,
                      imageUrl: '',
                    })),
                  })
                }
                className="p-3.5 rounded-2xl bg-bg-surface-hover hover:border-primary/40 border border-border/50 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">
                    {s.name}
                  </h4>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {new Date(s.date).toLocaleDateString(isAr ? 'ar-EG' : undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                    {' • '}
                    {formatDuration(s.duration, isAr)} • {s.exercises.length} {exercisesLabel}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] font-black uppercase"
                >
                  {selectLabel}
                </Button>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}

function LocationModal({
  open,
  onClose,
  isAr,
  title,
  placeholder,
  presets,
  saveLabel,
  value,
  onChange,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  isAr: boolean;
  title: string;
  placeholder: string;
  presets: string[];
  saveLabel: string;
  value: string;
  onChange: (v: string) => void;
  onPick: (loc: string) => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      icon={<MapPin className="h-5 w-5 text-rose-400" />}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-surface-hover border border-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-primary text-text-primary"
      />
      <div className="flex flex-wrap gap-1.5">
        {presets.map((loc) => (
          <button
            key={loc}
            onClick={() => onPick(loc)}
            className="px-2.5 py-1 rounded-xl bg-bg-surface text-xs font-bold text-text-muted hover:text-primary hover:border-primary/40 border border-border/30"
          >
            📍 {loc}
          </button>
        ))}
      </div>
      <Button
        disabled={!value.trim()}
        onClick={() => onPick(value.trim())}
        className="w-full py-2 text-xs font-black uppercase"
      >
        {saveLabel}
      </Button>
    </Modal>
  );
}

function PollModal({
  open,
  onClose,
  isAr,
  title,
  qLabel,
  qPlaceholder,
  optLabel,
  opt1,
  opt2,
  opt3,
  attachLabel,
  q,
  setQ,
  o1,
  setO1,
  o2,
  setO2,
  o3,
  setO3,
  onAttach,
}: {
  open: boolean;
  onClose: () => void;
  isAr: boolean;
  title: string;
  qLabel: string;
  qPlaceholder: string;
  optLabel: string;
  opt1: string;
  opt2: string;
  opt3: string;
  attachLabel: string;
  q: string;
  setQ: (v: string) => void;
  o1: string;
  setO1: (v: string) => void;
  o2: string;
  setO2: (v: string) => void;
  o3: string;
  setO3: (v: string) => void;
  onAttach: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      icon={<BarChart2 className="h-5 w-5 text-purple-400" />}
    >
      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-black uppercase text-text-muted">{qLabel}</label>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={qPlaceholder}
            className="w-full bg-bg-surface-hover border border-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-primary text-text-primary mt-1"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-text-muted">{optLabel}</label>
          <input
            type="text"
            value={o1}
            onChange={(e) => setO1(e.target.value)}
            placeholder={opt1}
            className="w-full bg-bg-surface-hover border border-border rounded-xl p-2 text-xs focus:outline-none focus:border-primary text-text-primary"
          />
          <input
            type="text"
            value={o2}
            onChange={(e) => setO2(e.target.value)}
            placeholder={opt2}
            className="w-full bg-bg-surface-hover border border-border rounded-xl p-2 text-xs focus:outline-none focus:border-primary text-text-primary"
          />
          <input
            type="text"
            value={o3}
            onChange={(e) => setO3(e.target.value)}
            placeholder={opt3}
            className="w-full bg-bg-surface-hover border border-border rounded-xl p-2 text-xs focus:outline-none focus:border-primary text-text-primary"
          />
        </div>
      </div>
      <Button
        disabled={!q.trim() || !o1.trim() || !o2.trim()}
        onClick={onAttach}
        className="w-full py-2 text-xs font-black uppercase"
      >
        {attachLabel}
      </Button>
    </Modal>
  );
}
