import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageSquare,
  Share2,
  Dumbbell,
  Clock,
  MapPin,
  Flame,
  Pencil,
  Trash2,
  Check,
  TrendingUp,
  Send,
} from 'lucide-react';
import type { FeedPost, PostComment } from '@/services/socialService';
import { cn } from '@/utils/cn';
import { formatDuration, formatVolume, getPostExercises } from './feedUtils';

export interface FeedLabels {
  recordsLabel: string;
  exercisesCount: string;
  kudos: string;
  commentsCount: string;
  deleteConfirm: string;
  following: string;
  follow: string;
  followingAr: string;
  followAr: string;
  commentPlaceholder: string;
  sets: string;
}

interface PostCardProps {
  post: FeedPost;
  isAr: boolean;
  labels: FeedLabels;
  following: string[];
  comments: PostComment[];
  currentUserId?: string;
  onKudos: (id: string) => void;
  onFollow: (uid: string) => void;
  onShare: (id: string) => void;
  onEdit: (post: FeedPost) => void;
  onDelete: (id: string) => void;
  onToggleComments: (id: string) => void;
  onCommentChange: (id: string, value: string) => void;
  onCommentSubmit: (id: string) => void;
  onVotePoll: (postId: string, optionIdx: number, uid: string) => void;
  newCommentValue: string;
  commentsExpanded: boolean;
}

export function PostCard({
  post,
  isAr,
  labels,
  following,
  comments,
  currentUserId,
  onKudos,
  onFollow,
  onShare,
  onEdit,
  onDelete,
  onToggleComments,
  onCommentChange,
  onCommentSubmit,
  onVotePoll,
  newCommentValue,
  commentsExpanded,
}: PostCardProps) {
  const isFollowing = following.includes(post.authorUid);
  const isOwner = post.authorUid === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card rounded-[2.5rem] p-6 border border-border/40 flex flex-col gap-5 shadow-xl hover:border-primary/20 transition-all bg-gradient-to-br from-white/[0.02] to-transparent"
    >
      {/* Author row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            {post.authorPhotoURL ? (
              <img
                src={post.authorPhotoURL}
                alt={post.authorName}
                className="w-11 h-11 rounded-full bg-bg-surface-hover object-cover border-2 border-primary/20 p-0.5 shadow-lg"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs border-2 border-primary/20 shadow-lg">
                {post.authorName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center border-2 border-bg-surface shadow-lg">
              <Flame className="h-2.5 w-2.5 text-black" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-[11px] text-text-primary uppercase tracking-wide">
                {post.authorName}
              </span>
              {post.feeling && (
                <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                  <span>{post.feeling.emoji}</span>
                  <span>{isAr ? post.feeling.textAr : post.feeling.textEn}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[9px] text-text-muted font-bold mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 opacity-50" />
                {new Date(post.createdAt).toLocaleDateString(isAr ? 'ar-EG' : undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {post.location && (
                <span className="flex items-center gap-0.5 text-blue-400">
                  <MapPin className="h-3 w-3" />
                  {post.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {isOwner ? (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(post)}
              className="p-2 rounded-xl bg-bg-surface-hover text-text-muted hover:text-primary transition-all border border-border/40"
              aria-label="Edit post"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(labels.deleteConfirm)) onDelete(post.id);
              }}
              className="p-2 rounded-xl bg-bg-surface-hover text-text-muted hover:text-danger transition-all border border-border/40"
              aria-label="Delete post"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onFollow(post.authorUid)}
            className={cn(
              'px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border',
              isFollowing
                ? 'bg-bg-surface text-text-muted border-border'
                : 'bg-primary text-black border-primary shadow-glow-primary',
            )}
          >
            {isFollowing
              ? isAr
                ? labels.followingAr
                : labels.following
              : isAr
                ? labels.followAr
                : labels.follow}
          </button>
        )}
      </div>

      {post.content && (
        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.hashtags.map((tag, i) => (
            <span
              key={i}
              className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Poll */}
      {post.poll && <PollBlock post={post} currentUserId={currentUserId} onVotePoll={onVotePoll} />}

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div
          className={cn(
            'grid gap-2 rounded-[2rem] overflow-hidden border border-border/40 shadow-inner bg-black/20',
            post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2',
          )}
        >
          {post.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn(
                'w-full object-cover aspect-square hover:scale-105 transition-transform duration-500',
                post.images!.length === 3 && i === 0 ? 'col-span-2 aspect-video' : '',
              )}
            />
          ))}
        </div>
      )}

      {/* Workout summary */}
      {post.workoutTitle && <WorkoutBlock post={post} isAr={isAr} labels={labels} />}

      {/* Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pt-2 px-1">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onKudos(post.id)}
              className="flex items-center gap-2 group transition-all"
            >
              <div
                className={cn(
                  'p-2.5 rounded-2xl transition-all shadow-lg border',
                  post.kudosCount > 0
                    ? 'bg-primary/10 border-primary/20 scale-110'
                    : 'bg-bg-surface-hover border-border group-hover:bg-primary/10 group-hover:border-primary/20',
                )}
              >
                <Heart
                  className={cn(
                    'h-5 w-5 transition-transform group-active:scale-125',
                    post.kudosCount > 0 ? 'fill-primary text-primary' : 'text-text-muted',
                  )}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black tabular-nums">
                  {post.kudosCount || '0'}
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                  {labels.kudos}
                </span>
              </div>
            </button>

            <button
              onClick={() => onToggleComments(post.id)}
              className="flex items-center gap-2 text-text-muted hover:text-primary transition-all group"
            >
              <div
                className={cn(
                  'p-2.5 rounded-2xl border transition-all shadow-lg',
                  commentsExpanded
                    ? 'bg-primary/10 border-primary/20 scale-110 text-primary'
                    : 'bg-bg-surface-hover border-border group-hover:bg-primary/10 group-hover:border-primary/20',
                )}
              >
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black">{comments.length}</span>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                  {labels.commentsCount}
                </span>
              </div>
            </button>
          </div>

          <button
            onClick={() => onShare(post.id)}
            className="p-2.5 rounded-2xl bg-bg-surface-hover border border-border text-text-muted hover:text-text-primary transition-all shadow-lg"
            aria-label="Share post"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence>
          {commentsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-4 pt-2"
            >
              <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                {comments.map((cmt) => (
                  <div
                    key={cmt.id}
                    className="flex gap-3 items-start bg-bg-surface/30 p-3 rounded-2xl border border-white/5"
                  >
                    {cmt.authorPhotoURL ? (
                      <img
                        src={cmt.authorPhotoURL}
                        className="w-8 h-8 rounded-full border border-border"
                        alt=""
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">
                        {cmt.authorName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-text-primary uppercase tracking-wide">
                          {cmt.authorName}
                        </span>
                        <span className="text-[8px] text-text-muted font-mono">
                          {new Date(cmt.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">{cmt.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative flex items-center gap-2 bg-bg-surface-hover/50 p-1 pl-3 rounded-2xl border border-border/40 focus-within:border-primary/40 transition-colors">
                <input
                  type="text"
                  value={newCommentValue}
                  onChange={(e) => onCommentChange(post.id, e.target.value)}
                  placeholder={labels.commentPlaceholder}
                  className="flex-1 bg-transparent border-none text-xs focus:ring-0 placeholder:text-text-muted"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onCommentSubmit(post.id);
                  }}
                />
                <button
                  onClick={() => onCommentSubmit(post.id)}
                  className="p-2 rounded-xl bg-primary text-black hover:shadow-glow-primary transition-all active:scale-95"
                  aria-label="Send comment"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function PollBlock({
  post,
  currentUserId,
  onVotePoll,
}: {
  post: FeedPost;
  currentUserId?: string;
  onVotePoll: (postId: string, optionIdx: number, uid: string) => void;
}) {
  const totalVotes = post.poll!.options.reduce((acc, opt) => acc + (opt.votes || 0), 0);
  return (
    <div className="bg-bg-surface/80 rounded-2xl p-4 border border-border/60 space-y-3">
      <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-wide">
        <span>📊</span>
        <span>{post.poll!.question}</span>
      </div>
      <div className="space-y-2">
        {post.poll!.options.map((option, idx) => {
          const isVoted = option.voters?.includes(currentUserId || '');
          const percentage =
            totalVotes > 0 ? Math.round(((option.votes || 0) / totalVotes) * 100) : 0;
          return (
            <button
              key={idx}
              onClick={() => currentUserId && onVotePoll(post.id, idx, currentUserId)}
              className={cn(
                'w-full text-left relative overflow-hidden rounded-xl p-3 border transition-all flex items-center justify-between',
                isVoted
                  ? 'border-primary bg-primary/10 font-black text-primary'
                  : 'border-border/60 bg-bg-surface-hover/50 hover:border-primary/40 text-text-primary',
              )}
            >
              {totalVotes > 0 && (
                <div
                  className="absolute inset-y-0 left-0 bg-primary/20 transition-all duration-500 pointer-events-none"
                  style={{ width: `${percentage}%` }}
                />
              )}
              <span className="relative z-10 text-xs font-bold flex items-center gap-2">
                {isVoted && <Check className="h-3.5 w-3.5 text-primary" />}
                {option.text}
              </span>
              <span className="relative z-10 text-[10px] font-bold tabular-nums text-text-muted">
                {percentage}% ({option.votes || 0})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WorkoutBlock({
  post,
  isAr,
  labels,
}: {
  post: FeedPost;
  isAr: boolean;
  labels: FeedLabels;
}) {
  const exercises = getPostExercises(post, isAr);
  return (
    <div className="bg-black/20 rounded-[2rem] p-6 border border-white/5 space-y-5 relative group overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110">
        <TrendingUp className="h-16 w-16 text-primary" />
      </div>
      <div className="relative z-10">
        <h4 className="text-base font-black text-text-primary uppercase tracking-tight leading-tight">
          {post.workoutTitle}
        </h4>
        <div className="flex gap-2 mt-2">
          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20">
            {formatDuration(post.duration || 0, isAr)}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white/5 text-text-muted text-[8px] font-black uppercase tracking-widest border border-white/5">
            {post.exercisesCount || 0} {labels.exercisesCount}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 relative z-10">
        <Stat label={isAr ? 'الحجم' : 'Vol'} value={formatVolume(post.totalVolume || 0, isAr)} />
        <Stat
          label={labels.recordsLabel}
          value={String(
            post.exercises?.reduce((acc, ex) => acc + ex.setsCount, 0) ||
              (post.exercisesCount || 0) * 3,
          )}
        />
        <Stat label="Intensity" valueHigh />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar relative z-10">
        {exercises.map((ex, idx) => (
          <div
            key={(ex.exerciseId || idx) + '-' + idx}
            className="flex-shrink-0 flex flex-col items-center bg-bg-surface-hover/40 border border-white/5 rounded-2xl p-2 w-24 hover:bg-bg-surface-hover transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center overflow-hidden mb-1.5 border border-white/5">
              {ex.imageUrl ? (
                <img
                  src={ex.imageUrl}
                  alt={ex.exerciseName}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Dumbbell className="w-4 w-4 text-text-muted" />
              )}
            </div>
            <span className="text-[9px] font-black text-primary leading-tight">
              {ex.setsCount} {labels.sets}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, valueHigh }: { label: string; value?: string; valueHigh?: boolean }) {
  return (
    <div className="p-3 bg-bg-surface/40 rounded-2xl border border-white/5 flex flex-col items-center gap-1 shadow-sm">
      <span className="text-[8px] text-text-muted font-black uppercase tracking-[0.2em]">
        {label}
      </span>
      {valueHigh ? (
        <div className="flex items-center gap-0.5 text-warning">
          <Flame className="h-3 w-3 fill-current" />
          <span className="text-[10px] font-black">High</span>
        </div>
      ) : (
        <span className="text-sm font-black text-text-primary tabular-nums">{value}</span>
      )}
    </div>
  );
}
