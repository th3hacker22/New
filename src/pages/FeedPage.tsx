import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  UserPlus,
  UserMinus,
  Dumbbell,
  Activity,
  Clock,
  Users,
  Compass,
  CheckCircle2,
  Flame,
  MessageSquare,
  Share2,
  Award,
  TrendingUp,
  Plus,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Send,
  X,
  MapPin,
  Smile,
  BarChart2,
  Globe,
  Lock,
  Tag,
  Sparkles,
  Check,
  ChevronDown,
  Calendar,
  Hash,
} from 'lucide-react';
import { useSocialStore } from '@/store/useSocialStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from '@tanstack/react-router';
import { DataEmptyState } from '@/components/ui/DataEmptyState';
import emptyWorkoutImg from '@/assets/images/empty_workout_illustration_new_1784773586918.jpg';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useSettingsStore } from '@/store/useSettingsStore';
import { FeedPost, socialService, PublicProfile, PostComment } from '@/services/socialService';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useToastStore } from '@/store/useToastStore';
import { workoutRepository, WorkoutSession } from '@/db';

// Preset feelings
const FEELINGS = [
  { id: 'pumped', emoji: '💥', textEn: 'Feeling Pumped', textAr: 'حاسس بحماس شديد' },
  { id: 'unstoppable', emoji: '⚡', textEn: 'Feeling Unstoppable', textAr: 'شعور لا يمكن إيقافي' },
  { id: 'pr', emoji: '🏆', textEn: 'Smashed a PR!', textAr: 'كسرت رقم قياسي جديد!' },
  { id: 'streak', emoji: '🔥', textEn: 'On a Streak!', textAr: 'مستمر بقوة!' },
  { id: 'recovery', emoji: '🧘', textEn: 'Recovery Day', textAr: 'يوم استشفاء وراحة' },
  { id: 'bulking', emoji: '🥩', textEn: 'Bulking Season', textAr: 'فترة تضخيم' },
  { id: 'cutting', emoji: '🔪', textEn: 'Cutting Mode', textAr: 'فترة تنشيف' },
  { id: 'legday', emoji: '🍗', textEn: 'Leg Day Smashed', textAr: 'خلصت يوم الرجلين' },
  { id: 'nutrition', emoji: '🥗', textEn: 'Nutrition Locked In', textAr: 'التغذية والدايت تمام' },
];

const POPULAR_HASHTAGS = [
  '#LegDay',
  '#BenchPR',
  '#PPL',
  '#NoExcuses',
  '#Bulking',
  '#Cutting',
  '#FitnessGoal',
  '#WorkoutDone',
];

const QUICK_EMOJIS = ['💪', '🔥', '🏆', '⚡', '🏋️‍♂️', '🎯', '🥗', '🥇', '💥', '👏', '💯', '🧘'];

const GYM_LOCATIONS = [
  "Gold's Gym",
  'Iron Paradise',
  'Home Gym',
  'World Gym',
  'Fitness First',
  'Outdoor Park',
];

export default function FeedPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { language } = useSettingsStore();
  const isAr = language === 'ar';

  // ── Social Store & Logic ──
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discovery' | 'following'>('discovery');
  const [suggestedUsers, setSuggestedUsers] = useState<PublicProfile[]>([]);
  const [postContent, setPostContent] = useState('');
  const [postImages, setPostImages] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  // ── Rich Post Creator States (Facebook/Twitter style) ──
  const [feeling, setFeeling] = useState<{ emoji: string; textEn: string; textAr: string } | null>(
    null,
  );
  const [locationTag, setLocationTag] = useState<string>('');
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public');
  const [selectedWorkout, setSelectedWorkout] = useState<{
    title: string;
    duration: number;
    volume: number;
    exercisesCount: number;
    exercises?: any[];
  } | null>(null);
  const [pollData, setPollData] = useState<{ question: string; options: string[] } | null>(null);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);

  // Modals visibility
  const [showFeelingModal, setShowFeelingModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);

  // Modal Inputs
  const [pollQuestionInput, setPollQuestionInput] = useState('');
  const [pollOption1Input, setPollOption1Input] = useState('');
  const [pollOption2Input, setPollOption2Input] = useState('');
  const [pollOption3Input, setPollOption3Input] = useState('');
  const [customLocationInput, setCustomLocationInput] = useState('');

  // User Local Workouts from Dexie
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);

  const {
    feed,
    globalFeed,
    following,
    searchResults,
    isLoading: isSocialLoading,
    isSearching,
    loadFollowing,
    loadFeed,
    loadGlobalFeed,
    createPost,
    updatePost,
    deletePost,
    addComment,
    loadComments,
    comments,
    searchUsers,
    follow,
    unfollow,
    giveKudos,
    votePoll,
    clearState,
  } = useSocialStore();

  useEffect(() => {
    if (user) {
      loadFollowing(user.uid).then(() => {
        loadFeed();
        loadGlobalFeed();
      });
      socialService.getSuggestedUsers(user.uid).then(setSuggestedUsers);

      // Fetch user's local completed sessions from Dexie for Attach Workout
      workoutRepository.recentCompleted(10).then(setRecentSessions).catch(console.error);
    } else {
      clearState();
    }
  }, [user, loadFollowing, loadFeed, loadGlobalFeed, clearState]);

  useEffect(() => {
    const delayDebounceData = setTimeout(() => {
      searchUsers(searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounceData);
  }, [searchQuery, searchUsers]);

  const handleKudos = (postId: string) => {
    giveKudos(postId);
  };

  const handleFollowToggle = (targetUid: string) => {
    if (!user) return;
    if (following.includes(targetUid)) {
      unfollow(user.uid, targetUid);
    } else {
      follow(user.uid, targetUid);
    }
  };

  const handleSharePost = (postId: string) => {
    const url = `${window.location.origin}/feed?post=${postId}`;
    navigator.clipboard.writeText(url);
    useToastStore.getState().addToast('success', t.shareSuccess);
  };

  const handlePostSubmit = async () => {
    if ((!postContent.trim() && postImages.length === 0 && !selectedWorkout && !pollData) || !user)
      return;

    setIsPosting(true);
    try {
      const imageUrls: string[] = [];
      if (storage) {
        for (const file of postImages) {
          const storageRef = ref(storage, `feed/${user.uid}/post_${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          imageUrls.push(url);
        }
      }

      const postPayload: any = {
        authorUid: user.uid,
        authorName: user.displayName || 'Unknown Athlete',
        authorPhotoURL: user.photoURL || null,
        content: postContent,
        images: imageUrls,
        privacy,
      };

      if (feeling) postPayload.feeling = feeling;
      if (locationTag) postPayload.location = locationTag;
      if (selectedWorkout) {
        if (selectedWorkout.title) postPayload.workoutTitle = selectedWorkout.title;
        if (selectedWorkout.duration) postPayload.duration = selectedWorkout.duration;
        if (selectedWorkout.volume) postPayload.totalVolume = selectedWorkout.volume;
        if (selectedWorkout.exercisesCount)
          postPayload.exercisesCount = selectedWorkout.exercisesCount;
        if (selectedWorkout.exercises) postPayload.exercises = selectedWorkout.exercises;
      }
      if (pollData) {
        postPayload.poll = {
          question: pollData.question,
          options: pollData.options.map((opt) => ({
            text: opt,
            votes: 0,
            voters: [],
          })),
        };
      }
      if (selectedHashtags.length > 0) {
        postPayload.hashtags = selectedHashtags;
      }

      if (editingPostId) {
        const updatePayload: any = {
          content: postContent,
          privacy,
        };
        if (imageUrls.length > 0) updatePayload.images = imageUrls;
        if (feeling) updatePayload.feeling = feeling;
        if (locationTag) updatePayload.location = locationTag;

        await updatePost(editingPostId, updatePayload);
        setEditingPostId(null);
      } else {
        await createPost(postPayload);
      }

      // Reset form
      setPostContent('');
      setPostImages([]);
      setFeeling(null);
      setLocationTag('');
      setSelectedWorkout(null);
      setPollData(null);
      setSelectedHashtags([]);
      useToastStore
        .getState()
        .addToast('success', isAr ? 'تم نشر البوست بنجاح! 🚀' : 'Post published successfully!');
    } catch (e) {
      console.error('Post failed:', e);
    } finally {
      setIsPosting(false);
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!newComment[postId]?.trim() || !user) return;
    await addComment(postId, {
      postId,
      authorUid: user.uid,
      authorName: user.displayName || 'Unknown Athlete',
      authorPhotoURL: user.photoURL || null,
      content: newComment[postId],
    });
    setNewComment({ ...newComment, [postId]: '' });
  };

  const toggleComments = (postId: string) => {
    const isExpanded = !expandedComments[postId];
    setExpandedComments({ ...expandedComments, [postId]: isExpanded });
    if (isExpanded) {
      loadComments(postId);
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    return isAr ? `${m} د` : `${m} min`;
  };

  const formatVolume = (volume: number) => {
    if (isAr) {
      if (volume >= 1000) return `${(volume / 1000).toFixed(1)} طن`;
      return `${volume} كجم`;
    }
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k kg`;
    return `${volume} kg`;
  };

  // Safe exercise list builder with fallback exercises
  const getPostExercises = (post: FeedPost) => {
    if (post.exercises && post.exercises.length > 0) {
      return post.exercises;
    }
    const mockDb = [
      {
        exerciseId: 'bench-press',
        exerciseName: isAr ? 'ضغط بنش بالبار' : 'Barbell Bench Press',
        setsCount: 4,
        imageUrl:
          'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/exercises/Barbell_Bench_Press/images/0.jpg',
      },
      {
        exerciseId: 'squat',
        exerciseName: isAr ? 'سكوات بالبار' : 'Barbell Squat',
        setsCount: 4,
        imageUrl:
          'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/exercises/Barbell_Squat/images/0.jpg',
      },
      {
        exerciseId: 'deadlift',
        exerciseName: isAr ? 'رفعة مميتة (ديدليفت)' : 'Deadlift',
        setsCount: 3,
        imageUrl:
          'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/exercises/Barbell_Deadlift/images/0.jpg',
      },
    ];
    return mockDb.slice(0, post.exercisesCount || 3);
  };

  // Translations
  const t = useMemo(
    () => ({
      title: isAr ? 'نبض المجتمع 🔥' : 'Community Pulse 🔥',
      subtitle: isAr
        ? 'شارك تمارينك وحدث أصدقائك ورياضييك المفضلين'
        : 'See what your friends and fellow athletes are lifting',
      discovery: isAr ? 'استكشاف' : 'Discovery',
      followingTab: isAr ? 'متابعات' : 'Following',
      postPlaceholder: isAr
        ? 'ايه في دماغك يا بطل؟ شارك تمرينك، رقمك القياسي أو أفكارك...'
        : "What's on your mind, athlete? Share a workout, PR, or thought...",
      postButton: isAr ? 'نشر' : 'Post',
      editButton: isAr ? 'تعديل' : 'Edit',
      deleteButton: isAr ? 'حذف' : 'Delete',
      commentPlaceholder: isAr ? 'اكتب تعليق...' : 'Write a comment...',
      commentsCount: isAr ? 'تعليقات' : 'Comments',
      shareSuccess: isAr ? 'تم نسخ الرابط!' : 'Link copied!',
      deleteConfirm: isAr
        ? 'متأكد انك عايز تمسح البوست ده؟'
        : 'Are you sure you want to delete this post?',
      searchPlaceholder: isAr ? 'ابحث عن رياضيين بالاسم...' : 'Search athletes (exact names)...',
      searchResults: isAr ? 'نتائج البحث' : 'Search Results',
      noAthletes: isAr ? 'لم يتم العثور على رياضيين.' : 'No athletes found.',
      recentActivity: isAr ? 'آخر الأنشطة الرياضية ⚡' : 'Recent Activity',
      followingCount: isAr ? 'متابع' : 'FOLLOWING',
      suggested: isAr ? 'أبطال ننصح بمتابعتهم ⚡' : 'Suggested Athletes',
      durationUnit: isAr ? 'د' : 'min',
      exercisesCount: isAr ? 'تمارين' : 'Exercises',
      volumeUnit: isAr ? 'طن' : 'k kg Vol',
      volumeUnitKg: isAr ? 'كجم' : 'kg Vol',
      setsUnit: isAr ? 'جولات' : 'Sets',
      kudos: isAr ? 'دعم' : 'عاش',
      feedQuiet: isAr ? 'موجز الأنشطة فارغ' : 'Your feed is quiet',
      feedQuietDesc: isAr
        ? 'ابحث عن رياضيين آخرين لمتابعة تمارينهم ومشاركتها.'
        : 'Search for other athletes using the bar above to populate your timeline.',
      searching: isAr ? 'جاري البحث...' : 'Searching...',
      signInRequired: isAr
        ? 'يجب تسجيل الدخول لمتابعة زملائك ومشاركة تمارينك الرياضية!'
        : 'Sign in to follow other athletes and share workouts!',
      signIn: isAr ? 'تسجيل الدخول' : 'Sign In',
      recordsLabel: isAr ? 'جولات' : 'Sets',
      volumeLabel: isAr ? 'الكم التدريبي' : 'توتال وزن',
      durationLabel: isAr ? 'المدة' : 'الوقت',
      attachWorkout: isAr ? 'إرفاق تمرين' : 'Attach Workout',
      feelingLabel: isAr ? 'الشعور' : 'Feeling',
      locationLabel: isAr ? 'موقع / جيم' : 'Location',
      pollLabel: isAr ? 'تصويت' : 'Poll',
      publicAudience: isAr ? 'الجميع 🌐' : 'Public 🌐',
      followersAudience: isAr ? 'المتابعون 👥' : 'Followers 👥',
      privateAudience: isAr ? 'أنا فقط 🔒' : 'Only Me 🔒',
    }),
    [isAr],
  );

  if (!user) {
    return (
      <div className="pt-20">
        <DataEmptyState
          icon={Users}
          title={t.title}
          description={t.signInRequired}
          actionLabel={t.signIn}
          onAction={() => navigate({ to: '/auth' })}
        />
      </div>
    );
  }

  const displayedPosts = activeTab === 'discovery' ? globalFeed : feed;

  return (
    <div
      className="flex flex-col gap-6 pb-24 w-full max-w-lg mx-auto animate-fade-in"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Title Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-black text-text-primary uppercase tracking-wider">{t.title}</h1>
        <p className="text-xs text-text-muted">{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-bg-surface-hover rounded-2xl border border-border/40">
        <button
          onClick={() => setActiveTab('discovery')}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2',
            activeTab === 'discovery'
              ? 'bg-bg-elevated text-primary shadow-lg border border-primary/10'
              : 'text-text-muted hover:text-text-primary',
          )}
        >
          <Compass className="h-4 w-4" />
          {t.discovery}
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2',
            activeTab === 'following'
              ? 'bg-bg-elevated text-primary shadow-lg border border-primary/10'
              : 'text-text-muted hover:text-text-primary',
          )}
        >
          <Users className="h-4 w-4" />
          {t.followingTab}
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className={`w-full bg-bg-surface-hover border border-border rounded-xl py-3 text-xs focus:outline-none focus:border-primary text-text-primary transition-all ${
            isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'
          }`}
        />
        <Search
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted ${
            isAr ? 'right-3' : 'left-3'
          }`}
        />
      </div>

      {/* ── RICH FACEBOOK / TWITTER STYLE POST COMPOSER ── */}
      {user && (
        <div className="glass-card rounded-[2.2rem] p-5 border border-primary/20 shadow-2xl bg-gradient-to-br from-bg-card via-bg-surface/50 to-bg-card space-y-4">
          {/* Top Bar: User Info & Privacy / Badges */}
          <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-3">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  className="w-10 h-10 rounded-full border border-primary/30 shadow-md object-cover"
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

                {/* Active Feeling / Location Badges inside top bar */}
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  {feeling && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      <span>{feeling.emoji}</span>
                      <span>{isAr ? feeling.textAr : feeling.textEn}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:opacity-80"
                        onClick={() => setFeeling(null)}
                      />
                    </span>
                  )}
                  {locationTag && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{locationTag}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:opacity-80"
                        onClick={() => setLocationTag('')}
                      />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Privacy Dropdown Pill */}
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as any)}
              className="text-[10px] font-black bg-bg-surface-hover text-text-muted border border-border/60 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="public">{t.publicAudience}</option>
              <option value="followers">{t.followersAudience}</option>
              <option value="private">{t.privateAudience}</option>
            </select>
          </div>

          {/* Main Text Area */}
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder={t.postPlaceholder}
            className="w-full bg-transparent border-none resize-none text-sm focus:ring-0 placeholder:text-text-muted/60 min-h-[80px] leading-relaxed"
          />

          {/* Quick Emojis Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 border-y border-border/20">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-wider shrink-0 px-1">
              <Smile className="h-3.5 w-3.5 inline mr-1 text-primary" />
            </span>
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setPostContent((prev) => prev + ' ' + emoji)}
                className="p-1.5 rounded-lg bg-bg-surface-hover/60 hover:bg-primary/20 transition-all text-xs shrink-0 active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Popular Hashtag Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <Hash className="h-3.5 w-3.5 text-text-muted shrink-0" />
            {POPULAR_HASHTAGS.map((tag) => {
              const isSelected = selectedHashtags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedHashtags(selectedHashtags.filter((t) => t !== tag));
                    } else {
                      setSelectedHashtags([...selectedHashtags, tag]);
                    }
                  }}
                  className={cn(
                    'px-2 py-0.5 rounded-md text-[10px] font-bold transition-all shrink-0 border',
                    isSelected
                      ? 'bg-primary text-primary-text border-primary font-black'
                      : 'bg-bg-surface-hover text-text-muted border-border/40 hover:text-text-primary',
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* ATTACHED PREVIEWS AREA */}

          {/* 1. Image Thumbnails Grid */}
          {postImages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
              {postImages.map((file, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border shadow-md shrink-0 group"
                >
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPostImages(postImages.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white hover:bg-danger transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 2. Attached Workout Preview Card */}
          {selectedWorkout && (
            <div className="relative p-3.5 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-text-primary uppercase tracking-wide">
                      {selectedWorkout.title}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-text">
                      {isAr ? 'مرفق' : 'Attached'}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-text-muted flex gap-3 mt-0.5">
                    <span>⏱️ {formatDuration(selectedWorkout.duration)}</span>
                    <span>💪 {formatVolume(selectedWorkout.volume)}</span>
                    <span>
                      📋 {selectedWorkout.exercisesCount} {t.exercisesCount}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWorkout(null)}
                className="p-1.5 rounded-lg bg-black/40 text-text-muted hover:text-danger hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* 3. Poll Preview Card */}
          {pollData && (
            <div className="relative p-3.5 rounded-2xl bg-bg-surface-hover/80 border border-border/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-black text-xs">
                  <BarChart2 className="h-4 w-4" />
                  <span>{isAr ? 'تصويت رياضي' : 'Poll Attachment'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPollData(null)}
                  className="p-1 rounded-lg hover:bg-danger/20 hover:text-danger transition-colors text-text-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs font-bold text-text-primary">{pollData.question}</p>
              <div className="space-y-1">
                {pollData.options.map((opt, i) => (
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

          {/* ── TOOLBAR ATTACHMENT ACTION BUTTONS (FB/Twitter Style) ── */}
          <div className="flex items-center justify-between pt-3 border-t border-border/30 flex-wrap gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              {/* Image Upload Button */}
              <label className="cursor-pointer px-2.5 py-1.5 rounded-xl bg-bg-surface-hover hover:bg-primary/10 hover:text-primary transition-all text-text-muted text-xs font-bold flex items-center gap-1.5 border border-border/30">
                <ImageIcon className="h-4 w-4 text-emerald-400" />
                <span className="hidden sm:inline">{isAr ? 'صور' : 'Photo'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files)
                      setPostImages((prev) => [...prev, ...Array.from(e.target.files!)]);
                  }}
                />
              </label>

              {/* Attach Workout Button */}
              <button
                type="button"
                onClick={() => setShowWorkoutModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-bg-surface-hover hover:bg-primary/10 hover:text-primary transition-all text-text-muted text-xs font-bold flex items-center gap-1.5 border border-border/30"
              >
                <Dumbbell className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">{t.attachWorkout}</span>
              </button>

              {/* Feeling/Mood Button */}
              <button
                type="button"
                onClick={() => setShowFeelingModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-bg-surface-hover hover:bg-primary/10 hover:text-primary transition-all text-text-muted text-xs font-bold flex items-center gap-1.5 border border-border/30"
              >
                <Smile className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline">{t.feelingLabel}</span>
              </button>

              {/* Poll Button */}
              <button
                type="button"
                onClick={() => setShowPollModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-bg-surface-hover hover:bg-primary/10 hover:text-primary transition-all text-text-muted text-xs font-bold flex items-center gap-1.5 border border-border/30"
              >
                <BarChart2 className="h-4 w-4 text-purple-400" />
                <span className="hidden sm:inline">{t.pollLabel}</span>
              </button>

              {/* Location Tag Button */}
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-bg-surface-hover hover:bg-primary/10 hover:text-primary transition-all text-text-muted text-xs font-bold flex items-center gap-1.5 border border-border/30"
              >
                <MapPin className="h-4 w-4 text-rose-400" />
                <span className="hidden sm:inline">{t.locationLabel}</span>
              </button>
            </div>

            {/* Submit Post Button */}
            <Button
              onClick={handlePostSubmit}
              disabled={
                isPosting ||
                (!postContent.trim() && postImages.length === 0 && !selectedWorkout && !pollData)
              }
              className="rounded-xl px-5 py-2 text-xs font-black uppercase tracking-widest bg-primary text-black hover:shadow-glow-primary transition-all shadow-md"
            >
              {isPosting ? (isAr ? 'جاري النشر...' : 'Posting...') : t.postButton}
            </Button>
          </div>
        </div>
      )}

      {/* ── MODALS FOR COMPOSER TOOLBAR ATTACHMENTS ── */}

      {/* 1. Feeling / Mood Modal */}
      <AnimatePresence>
        {showFeelingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-3xl bg-bg-card p-5 border border-border/80 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2 text-primary font-black text-sm">
                  <Smile className="h-5 w-5 text-amber-400" />
                  <span>{isAr ? 'ما هو شعورك الآن؟' : 'How are you feeling?'}</span>
                </div>
                <button
                  onClick={() => setShowFeelingModal(false)}
                  className="p-1 text-text-muted hover:text-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto no-scrollbar">
                {FEELINGS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setFeeling(item);
                      setShowFeelingModal(false);
                    }}
                    className="p-3 rounded-2xl bg-bg-surface-hover hover:bg-primary/20 hover:border-primary/40 border border-border/40 transition-all flex items-center gap-2.5 text-left"
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-xs font-bold text-text-primary">
                      {isAr ? item.textAr : item.textEn}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Attach Workout Modal */}
      <AnimatePresence>
        {showWorkoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md rounded-3xl bg-bg-card p-5 border border-border/80 shadow-2xl space-y-4 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2 text-primary font-black text-sm">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  <span>{isAr ? 'اختر تمرين من سجلك' : 'Select Completed Workout'}</span>
                </div>
                <button
                  onClick={() => setShowWorkoutModal(false)}
                  className="p-1 text-text-muted hover:text-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-3 flex-1 pr-1 no-scrollbar">
                {recentSessions.length === 0 ? (
                  <div className="text-center py-8 text-text-muted space-y-2">
                    <Dumbbell className="h-8 w-8 mx-auto text-text-muted/40" />
                    <p className="text-xs font-bold">
                      {isAr
                        ? 'لم تقم بإنهاء أي تمرين مؤخراً'
                        : 'No recent completed workout sessions found'}
                    </p>
                  </div>
                ) : (
                  recentSessions.map((s) => {
                    const totalVol = s.exercises.reduce(
                      (acc, ex) =>
                        acc +
                        ex.sets.reduce(
                          (sAcc, set) => sAcc + (set.completed ? set.weight * set.reps : 0),
                          0,
                        ),
                      0,
                    );
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedWorkout({
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
                          });
                          setShowWorkoutModal(false);
                        }}
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
                            })}{' '}
                            • {formatDuration(s.duration)} • {s.exercises.length} {t.exercisesCount}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] font-black uppercase"
                        >
                          {isAr ? 'إرفاق' : 'Select'}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Location Modal */}
      <AnimatePresence>
        {showLocationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-3xl bg-bg-card p-5 border border-border/80 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2 text-rose-400 font-black text-sm">
                  <MapPin className="h-5 w-5" />
                  <span>{isAr ? 'إضافة الجيم أو الموقع' : 'Add Gym / Location'}</span>
                </div>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="p-1 text-text-muted hover:text-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <input
                type="text"
                value={customLocationInput}
                onChange={(e) => setCustomLocationInput(e.target.value)}
                placeholder={isAr ? 'اسم الجيم...' : 'Enter gym or spot name...'}
                className="w-full bg-bg-surface-hover border border-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-primary text-text-primary"
              />

              <div className="flex flex-wrap gap-1.5">
                {GYM_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setLocationTag(loc);
                      setShowLocationModal(false);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-bg-surface text-xs font-bold text-text-muted hover:text-primary hover:border-primary/40 border border-border/30 transition-all"
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>

              <Button
                disabled={!customLocationInput.trim()}
                onClick={() => {
                  setLocationTag(customLocationInput.trim());
                  setShowLocationModal(false);
                  setCustomLocationInput('');
                }}
                className="w-full py-2 text-xs font-black uppercase"
              >
                {isAr ? 'حفظ الموقع' : 'Set Location'}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Poll Modal */}
      <AnimatePresence>
        {showPollModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-3xl bg-bg-card p-5 border border-border/80 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2 text-purple-400 font-black text-sm">
                  <BarChart2 className="h-5 w-5" />
                  <span>{isAr ? 'إنشاء تصويت' : 'Create Poll'}</span>
                </div>
                <button
                  onClick={() => setShowPollModal(false)}
                  className="p-1 text-text-muted hover:text-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-text-muted">
                    {isAr ? 'السؤال' : 'Question'}
                  </label>
                  <input
                    type="text"
                    value={pollQuestionInput}
                    onChange={(e) => setPollQuestionInput(e.target.value)}
                    placeholder={
                      isAr ? 'مثال: أي تمرين بنش أفضل؟' : 'e.g. Which bench angle is best?'
                    }
                    className="w-full bg-bg-surface-hover border border-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-primary text-text-primary mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-text-muted">
                    {isAr ? 'الخيارات' : 'Options'}
                  </label>
                  <input
                    type="text"
                    value={pollOption1Input}
                    onChange={(e) => setPollOption1Input(e.target.value)}
                    placeholder={isAr ? 'الخيار 1' : 'Option 1'}
                    className="w-full bg-bg-surface-hover border border-border rounded-xl p-2 text-xs focus:outline-none focus:border-primary text-text-primary"
                  />
                  <input
                    type="text"
                    value={pollOption2Input}
                    onChange={(e) => setPollOption2Input(e.target.value)}
                    placeholder={isAr ? 'الخيار 2' : 'Option 2'}
                    className="w-full bg-bg-surface-hover border border-border rounded-xl p-2 text-xs focus:outline-none focus:border-primary text-text-primary"
                  />
                  <input
                    type="text"
                    value={pollOption3Input}
                    onChange={(e) => setPollOption3Input(e.target.value)}
                    placeholder={isAr ? 'الخيار 3 (اختياري)' : 'Option 3 (Optional)'}
                    className="w-full bg-bg-surface-hover border border-border rounded-xl p-2 text-xs focus:outline-none focus:border-primary text-text-primary"
                  />
                </div>
              </div>

              <Button
                disabled={
                  !pollQuestionInput.trim() || !pollOption1Input.trim() || !pollOption2Input.trim()
                }
                onClick={() => {
                  const opts = [pollOption1Input.trim(), pollOption2Input.trim()];
                  if (pollOption3Input.trim()) opts.push(pollOption3Input.trim());
                  setPollData({
                    question: pollQuestionInput.trim(),
                    options: opts,
                  });
                  setShowPollModal(false);
                }}
                className="w-full py-2 text-xs font-black uppercase"
              >
                {isAr ? 'إضافة التصويت' : 'Attach Poll'}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SEARCH RESULTS ── */}
      {searchQuery.trim().length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] font-bold uppercase text-text-muted tracking-wider">
            {t.searchResults}
          </h3>
          {isSearching ? (
            <div className="text-xs text-text-muted text-center py-4">{t.searching}</div>
          ) : searchResults.length === 0 ? (
            <div className="text-xs text-text-muted text-center py-4">{t.noAthletes}</div>
          ) : (
            searchResults
              .filter((r) => r.uid !== user.uid)
              .map((res) => {
                const isFollowing = following.includes(res.uid);
                return (
                  <div
                    key={res.uid}
                    className="flex items-center justify-between bg-bg-surface-hover p-3 rounded-xl border border-border"
                  >
                    <div className="flex items-center gap-3">
                      {res.photoURL ? (
                        <img
                          src={res.photoURL}
                          alt={res.displayName}
                          className="w-9 h-9 rounded-full bg-bg-surface-hover object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {res.displayName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-bold text-xs text-text-primary">{res.displayName}</span>
                    </div>
                    <button
                      onClick={() => handleFollowToggle(res.uid)}
                      className={`p-2 rounded-lg transition-colors ${
                        isFollowing
                          ? 'bg-bg-surface-hover text-text-muted hover:text-text-primary'
                          : 'bg-primary text-black hover:bg-primary-hover'
                      }`}
                    >
                      {isFollowing ? (
                        <UserMinus className="w-3.5 h-3.5" />
                      ) : (
                        <UserPlus className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* ── FEED LIST ── */}
      {searchQuery.trim().length === 0 && (
        <div className="flex flex-col gap-6">
          {/* Suggested Athletes Rail */}
          {activeTab === 'discovery' && suggestedUsers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">
                {t.suggested}
              </h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {suggestedUsers.map((u) => (
                  <motion.div
                    key={u.uid}
                    whileHover={{ y: -4 }}
                    className="flex-shrink-0 w-36 glass-card rounded-3xl p-4 border border-border/40 flex flex-col items-center text-center gap-3 bg-gradient-to-br from-white/[0.03] to-transparent"
                  >
                    <div className="relative">
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt={u.displayName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 p-0.5"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl border-2 border-primary/20">
                          {u.displayName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {following.includes(u.uid) && (
                        <div className="absolute -bottom-1 -right-1 bg-primary text-black rounded-full p-1 border-2 border-bg-surface">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden w-full">
                      <p className="text-[11px] font-black text-text-primary truncate">
                        {u.displayName}
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <Award className="h-2.5 w-2.5 text-warning" />
                        <span className="text-[8px] text-text-muted font-black uppercase tracking-widest">
                          Athlete
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollowToggle(u.uid)}
                      className={cn(
                        'w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95',
                        following.includes(u.uid)
                          ? 'bg-bg-surface text-text-muted border border-border'
                          : 'bg-primary text-black shadow-glow-primary border border-primary',
                      )}
                    >
                      {following.includes(u.uid)
                        ? isAr
                          ? 'متابع'
                          : 'Unfollow'
                        : isAr
                          ? 'متابعة'
                          : 'Follow'}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Hashtags */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">
              {isAr ? 'هاشتاجات شائعة' : 'Trending Hashtags'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_HASHTAGS.map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-bg-surface border border-border/40 text-xs font-bold text-text-muted hover:text-primary hover:border-primary/40 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase text-text-muted tracking-wider">
              {t.recentActivity}
            </h3>
            <span className="text-[9px] text-text-muted/50 uppercase tracking-widest font-mono">
              {activeTab === 'following' ? `${following.length} ${t.followingCount}` : ''}
            </span>
          </div>

          {isSocialLoading ? (
            <div className="flex flex-col gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : displayedPosts.length === 0 ? (
            <DataEmptyState
              imageSrc={emptyWorkoutImg}
              title={t.feedQuiet}
              description={t.feedQuietDesc}
            />
          ) : (
            <AnimatePresence mode="popLayout">
              {displayedPosts.map((post) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={post.id}
                  className="glass-card rounded-[2.5rem] p-6 border border-border/40 flex flex-col gap-5 shadow-xl hover:border-primary/20 transition-all bg-gradient-to-br from-white/[0.02] to-transparent"
                >
                  {/* Post Author info & Feeling / Location Badges */}
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
                            {new Date(post.createdAt).toLocaleDateString(
                              isAr ? 'ar-EG' : undefined,
                              {
                                month: 'short',
                                day: 'numeric',
                              },
                            )}
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

                    {post.authorUid === user?.uid ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingPostId(post.id);
                            setPostContent(post.content || '');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-2 rounded-xl bg-bg-surface-hover text-text-muted hover:text-primary transition-all border border-border/40"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t.deleteConfirm)) deletePost(post.id);
                          }}
                          className="p-2 rounded-xl bg-bg-surface-hover text-text-muted hover:text-danger transition-all border border-border/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleFollowToggle(post.authorUid)}
                        className={cn(
                          'px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border',
                          following.includes(post.authorUid)
                            ? 'bg-bg-surface text-text-muted border-border'
                            : 'bg-primary text-black border-primary shadow-glow-primary',
                        )}
                      >
                        {following.includes(post.authorUid)
                          ? isAr
                            ? 'متابع ✅'
                            : 'Following'
                          : isAr
                            ? 'متابعة'
                            : 'Follow'}
                      </button>
                    )}
                  </div>

                  {/* Post Content Body */}
                  {post.content && (
                    <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  )}

                  {/* Hashtags */}
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

                  {/* Poll Attachment */}
                  {post.poll && (
                    <div className="bg-bg-surface/80 rounded-2xl p-4 border border-border/60 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-wide">
                        <BarChart2 className="h-4 w-4" />
                        <span>{post.poll.question}</span>
                      </div>
                      <div className="space-y-2">
                        {(() => {
                          const totalVotes = post.poll.options.reduce(
                            (acc, opt) => acc + (opt.votes || 0),
                            0,
                          );
                          return post.poll.options.map((option, idx) => {
                            const isVoted = option.voters?.includes(user?.uid || '');
                            const percentage =
                              totalVotes > 0
                                ? Math.round(((option.votes || 0) / totalVotes) * 100)
                                : 0;
                            return (
                              <button
                                key={idx}
                                onClick={() => user && votePoll(post.id, idx, user.uid)}
                                className={cn(
                                  'w-full text-left relative overflow-hidden rounded-xl p-3 border transition-all flex items-center justify-between',
                                  isVoted
                                    ? 'border-primary bg-primary/10 font-black text-primary'
                                    : 'border-border/60 bg-bg-surface-hover/50 hover:border-primary/40 text-text-primary',
                                )}
                              >
                                {/* Progress background */}
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
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Post Images Grid */}
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
                          className={cn(
                            'w-full object-cover aspect-square hover:scale-105 transition-transform duration-500',
                            post.images!.length === 3 && i === 0 ? 'col-span-2 aspect-video' : '',
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {/* Workout details card */}
                  {post.workoutTitle && (
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
                            {formatDuration(post.duration || 0)}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-text-muted text-[8px] font-black uppercase tracking-widest border border-white/5">
                            {post.exercisesCount || 0} {t.exercisesCount}
                          </span>
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-3 relative z-10">
                        <div className="p-3 bg-bg-surface/40 rounded-2xl border border-white/5 flex flex-col items-center gap-1 shadow-sm">
                          <span className="text-[8px] text-text-muted font-black uppercase tracking-[0.2em]">
                            {isAr ? 'الحجم' : 'Vol'}
                          </span>
                          <span className="text-sm font-black text-text-primary tabular-nums">
                            {formatVolume(post.totalVolume || 0)}
                          </span>
                        </div>
                        <div className="p-3 bg-bg-surface/40 rounded-2xl border border-white/5 flex flex-col items-center gap-1 shadow-sm">
                          <span className="text-[8px] text-text-muted font-black uppercase tracking-[0.2em]">
                            {t.recordsLabel}
                          </span>
                          <span className="text-sm font-black text-text-primary tabular-nums">
                            {post.exercises?.reduce((acc, ex) => acc + ex.setsCount, 0) ||
                              (post.exercisesCount || 0) * 3}
                          </span>
                        </div>
                        <div className="p-3 bg-bg-surface/40 rounded-2xl border border-white/5 flex flex-col items-center gap-1 shadow-sm">
                          <span className="text-[8px] text-text-muted font-black uppercase tracking-[0.2em]">
                            Intensity
                          </span>
                          <div className="flex items-center gap-0.5 text-warning">
                            <Flame className="h-3 w-3 fill-current" />
                            <span className="text-[10px] font-black">High</span>
                          </div>
                        </div>
                      </div>

                      {/* Exercise Thumbnails */}
                      <div className="flex gap-2 overflow-x-auto no-scrollbar relative z-10">
                        {getPostExercises(post).map((ex, idx) => (
                          <div
                            key={(ex.exerciseId || idx) + '-' + idx}
                            className="flex-shrink-0 flex flex-col items-center bg-bg-surface-hover/40 border border-white/5 rounded-2xl p-2 w-24 hover:bg-bg-surface-hover transition-colors"
                          >
                            <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center overflow-hidden mb-1.5 border border-white/5">
                              {ex.imageUrl ? (
                                <img
                                  src={ex.imageUrl}
                                  alt={ex.exerciseName}
                                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <Dumbbell className="w-4 h-4 text-text-muted" />
                              )}
                            </div>
                            <span className="text-[9px] font-black text-primary leading-tight">
                              {ex.setsCount} {isAr ? 'جولات' : 'Sets'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Likes/Kudos/Comments Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pt-2 px-1">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleKudos(post.id)}
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
                                post.kudosCount > 0
                                  ? 'fill-primary text-primary'
                                  : 'text-text-muted',
                              )}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black tabular-nums">
                              {post.kudosCount || '0'}
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                              {t.kudos}
                            </span>
                          </div>
                        </button>

                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-2 text-text-muted hover:text-primary transition-all group"
                        >
                          <div
                            className={cn(
                              'p-2.5 rounded-2xl border transition-all shadow-lg',
                              expandedComments[post.id]
                                ? 'bg-primary/10 border-primary/20 scale-110 text-primary'
                                : 'bg-bg-surface-hover border-border group-hover:bg-primary/10 group-hover:border-primary/20',
                            )}
                          >
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black">
                              {comments[post.id]?.length || 0}
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                              {t.commentsCount}
                            </span>
                          </div>
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSharePost(post.id)}
                          className="p-2.5 rounded-2xl bg-bg-surface-hover border border-border text-text-muted hover:text-text-primary transition-all shadow-lg"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Comments Dropdown */}
                    <AnimatePresence>
                      {expandedComments[post.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-4 pt-2"
                        >
                          <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                            {comments[post.id]?.map((cmt) => (
                              <div
                                key={cmt.id}
                                className="flex gap-3 items-start bg-bg-surface/30 p-3 rounded-2xl border border-white/5"
                              >
                                {cmt.authorPhotoURL ? (
                                  <img
                                    src={cmt.authorPhotoURL}
                                    className="w-8 h-8 rounded-full border border-border"
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
                              value={newComment[post.id] || ''}
                              onChange={(e) =>
                                setNewComment({ ...newComment, [post.id]: e.target.value })
                              }
                              placeholder={t.commentPlaceholder}
                              className="flex-1 bg-transparent border-none text-xs focus:ring-0 placeholder:text-text-muted"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCommentSubmit(post.id);
                              }}
                            />
                            <button
                              onClick={() => handleCommentSubmit(post.id)}
                              className="p-2 rounded-xl bg-primary text-black hover:shadow-glow-primary transition-all active:scale-95"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
}
