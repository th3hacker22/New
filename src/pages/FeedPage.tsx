import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, UserMinus, Users, Compass, CheckCircle2, Award } from 'lucide-react';
import { useSocialStore } from '@/store/useSocialStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from '@tanstack/react-router';
import { DataEmptyState } from '@/components/ui/DataEmptyState';
import emptyWorkoutImg from '@/assets/images/empty_workout_illustration_new_1784773586918.jpg';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useSettingsStore } from '@/store/useSettingsStore';
import { socialService, type PublicProfile } from '@/services/socialService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useToastStore } from '@/store/useToastStore';
import { workoutRepository, type WorkoutSession } from '@/db';
import { cn } from '@/utils/cn';
import { PostCard, type FeedLabels } from '@/components/feed/PostCard';
import {
  PostComposer,
  type ComposerLabels,
  type FeelingType,
  type Privacy,
} from '@/components/feed/PostComposer';

const FEELINGS: FeelingType[] = [
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

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discovery' | 'following'>('discovery');
  const [suggestedUsers, setSuggestedUsers] = useState<PublicProfile[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
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
      workoutRepository.recentCompleted(10).then(setRecentSessions).catch(console.error);
    } else {
      clearState();
    }
  }, [user, loadFollowing, loadFeed, loadGlobalFeed, clearState]);

  useEffect(() => {
    const t = setTimeout(() => searchUsers(searchQuery), 500);
    return () => clearTimeout(t);
  }, [searchQuery, searchUsers]);

  const handleFollowToggle = (uid: string) => {
    if (!user) return;
    if (following.includes(uid)) unfollow(user.uid, uid);
    else follow(user.uid, uid);
  };

  const handleSharePost = (postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/feed?post=${postId}`);
    useToastStore.getState().addToast('success', labels.shareSuccess);
  };

  const handlePostSubmit = async (data: {
    content: string;
    images: File[];
    feeling: FeelingType | null;
    location: string;
    privacy: Privacy;
    workout: unknown;
    poll: { question: string; options: string[] } | null;
    hashtags: string[];
  }) => {
    if (!user) return;
    setIsPosting(true);
    try {
      const imageUrls: string[] = [];
      if (storage) {
        for (const file of data.images) {
          const r = ref(storage, `feed/${user.uid}/post_${Date.now()}_${file.name}`);
          await uploadBytes(r, file);
          imageUrls.push(await getDownloadURL(r));
        }
      }

      const payload: Record<string, unknown> = {
        authorUid: user.uid,
        authorName: user.displayName || 'Unknown Athlete',
        authorPhotoURL: user.photoURL || null,
        content: data.content,
        images: imageUrls,
        privacy: data.privacy,
      };
      if (data.feeling) payload.feeling = data.feeling;
      if (data.location) payload.location = data.location;
      const w = data.workout as Record<string, unknown> | null;
      if (w) {
        if (w.title) payload.workoutTitle = w.title;
        if (w.duration) payload.duration = w.duration;
        if (w.volume) payload.totalVolume = w.volume;
        if (w.exercisesCount) payload.exercisesCount = w.exercisesCount;
        if (w.exercises) payload.exercises = w.exercises;
      }
      if (data.poll) {
        payload.poll = {
          question: data.poll.question,
          options: data.poll.options.map((opt) => ({ text: opt, votes: 0, voters: [] })),
        };
      }
      if (data.hashtags.length) payload.hashtags = data.hashtags;

      if (editingPostId) {
        await updatePost(editingPostId, {
          content: data.content,
          privacy: data.privacy,
          ...(imageUrls.length && { images: imageUrls }),
          ...(data.feeling && { feeling: data.feeling }),
          ...(data.location && { location: data.location }),
        });
        setEditingPostId(null);
      } else {
        await createPost(payload as never);
      }

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
    const expanded = !expandedComments[postId];
    setExpandedComments({ ...expandedComments, [postId]: expanded });
    if (expanded) loadComments(postId);
  };

  const labels = useMemo<
    FeedLabels &
      ComposerLabels & {
        title: string;
        subtitle: string;
        discovery: string;
        followingTab: string;
        searchPlaceholder: string;
        searchResults: string;
        noAthletes: string;
        searching: string;
        recentActivity: string;
        followingCount: string;
        suggested: string;
        signInRequired: string;
        signIn: string;
        trendingTags: string;
        shareSuccess: string;
        feedQuiet: string;
        feedQuietDesc: string;
        editButton: string;
        deleteButton: string;
      }
  >(
    () => ({
      title: isAr ? 'نبض المجتمع 🔥' : 'Community Pulse 🔥',
      subtitle: isAr
        ? 'شارك تمارينك وحدث أصدقائك'
        : 'See what your friends and fellow athletes are lifting',
      discovery: isAr ? 'استكشاف' : 'Discovery',
      followingTab: isAr ? 'متابعات' : 'Following',
      postPlaceholder: isAr ? 'ايه في دماغك يا بطل؟...' : "What's on your mind, athlete?...",
      postButton: isAr ? 'نشر' : 'Post',
      posting: isAr ? 'جاري النشر...' : 'Posting...',
      editButton: isAr ? 'تعديل' : 'Edit',
      deleteButton: isAr ? 'حذف' : 'Delete',
      commentPlaceholder: isAr ? 'اكتب تعليق...' : 'Write a comment...',
      commentsCount: isAr ? 'تعليقات' : 'Comments',
      shareSuccess: isAr ? 'تم نسخ الرابط!' : 'Link copied!',
      deleteConfirm: isAr
        ? 'متأكد انك عايز تمسح البوست ده؟'
        : 'Are you sure you want to delete this post?',
      searchPlaceholder: isAr ? 'ابحث عن رياضيين...' : 'Search athletes...',
      searchResults: isAr ? 'نتائج البحث' : 'Search Results',
      noAthletes: isAr ? 'لم يتم العثور على رياضيين.' : 'No athletes found.',
      searching: isAr ? 'جاري البحث...' : 'Searching...',
      recentActivity: isAr ? 'آخر الأنشطة ⚡' : 'Recent Activity',
      followingCount: isAr ? 'متابع' : 'FOLLOWING',
      suggested: isAr ? 'أبطال ننصح بمتابعتهم ⚡' : 'Suggested Athletes',
      signInRequired: isAr
        ? 'يجب تسجيل الدخول لمتابعة زملائك ومشاركة تمارينك!'
        : 'Sign in to follow other athletes and share workouts!',
      signIn: isAr ? 'تسجيل الدخول' : 'Sign In',
      trendingTags: isAr ? 'هاشتاجات شائعة' : 'Trending Hashtags',
      recordsLabel: isAr ? 'جولات' : 'Sets',
      exercisesCount: isAr ? 'تمارين' : 'Exercises',
      kudos: isAr ? 'دعم' : 'عاش',
      feedQuiet: isAr ? 'موجز الأنشطة فارغ' : 'Your feed is quiet',
      feedQuietDesc: isAr
        ? 'ابحث عن رياضيين آخرين لمتابعة تمارينهم.'
        : 'Search for other athletes to populate your timeline.',
      durationUnit: isAr ? 'د' : 'min',
      volumeUnit: isAr ? 'طن' : 'k kg Vol',
      sets: isAr ? 'جولات' : 'Sets',
      following: 'Following',
      follow: 'Follow',
      followingAr: 'متابع ✅',
      followAr: 'متابعة',
      photo: isAr ? 'صور' : 'Photo',
      attachWorkout: isAr ? 'إرفاق تمرين' : 'Attach Workout',
      feelingLabel: isAr ? 'الشعور' : 'Feeling',
      pollLabel: isAr ? 'تصويت' : 'Poll',
      locationLabel: isAr ? 'موقع' : 'Location',
      publicAudience: isAr ? 'الجميع 🌐' : 'Public 🌐',
      followersAudience: isAr ? 'المتابعون 👥' : 'Followers 👥',
      privateAudience: isAr ? 'أنا فقط 🔒' : 'Only Me 🔒',
      attached: isAr ? 'مرفق' : 'Attached',
      pollAttachment: isAr ? 'تصويت رياضي' : 'Poll Attachment',
      howFeeling: isAr ? 'إيه شعورك؟' : 'How are you feeling?',
      selectWorkout: isAr ? 'اختر تمرين من سجلك' : 'Select Completed Workout',
      noWorkouts: isAr ? 'لا توجد تمارين مكتملة' : 'No recent completed workout sessions found',
      select: isAr ? 'إرفاق' : 'Select',
      addLocation: isAr ? 'إضافة موقع' : 'Add Gym / Location',
      locationPlaceholder: isAr ? 'اسم الجيم...' : 'Enter gym or spot name...',
      setLocation: isAr ? 'حفظ الموقع' : 'Set Location',
      createPoll: isAr ? 'إنشاء تصويت' : 'Create Poll',
      question: isAr ? 'السؤال' : 'Question',
      questionPlaceholder: isAr ? 'مثال: أي تمرين بنش أفضل؟' : 'e.g. Which bench angle is best?',
      options: isAr ? 'الخيارات' : 'Options',
      option1: isAr ? 'الخيار 1' : 'Option 1',
      option2: isAr ? 'الخيار 2' : 'Option 2',
      option3: isAr ? 'الخيار 3 (اختياري)' : 'Option 3 (Optional)',
      attachPoll: isAr ? 'إضافة التصويت' : 'Attach Poll',
      presetLocations: GYM_LOCATIONS,
    }),
    [isAr],
  );

  if (!user) {
    return (
      <div className="pt-20">
        <DataEmptyState
          icon={Users}
          title={labels.title}
          description={labels.signInRequired}
          actionLabel={labels.signIn}
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
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-black text-text-primary uppercase tracking-wider">
          {labels.title}
        </h1>
        <p className="text-xs text-text-muted">{labels.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-bg-surface-hover rounded-2xl border border-border/40">
        <TabButton
          active={activeTab === 'discovery'}
          onClick={() => setActiveTab('discovery')}
          icon={<Compass className="h-4 w-4" />}
          label={labels.discovery}
        />
        <TabButton
          active={activeTab === 'following'}
          onClick={() => setActiveTab('following')}
          icon={<Users className="h-4 w-4" />}
          label={labels.followingTab}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className={cn(
            'w-full bg-bg-surface-hover border border-border rounded-xl py-3 text-xs focus:outline-none focus:border-primary text-text-primary transition-all',
            isAr ? 'pr-10 pl-4' : 'pl-10 pr-4',
          )}
        />
        <Search
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted',
            isAr ? 'right-3' : 'left-3',
          )}
        />
      </div>

      <PostComposer
        user={user as unknown as import('firebase/auth').User}
        isAr={isAr}
        labels={labels}
        recentSessions={recentSessions}
        isPosting={isPosting}
        editingId={editingPostId}
        onSubmit={handlePostSubmit}
        onCancelEdit={() => setEditingPostId(null)}
        popularHashtags={POPULAR_HASHTAGS}
        feelings={FEELINGS}
      />

      {/* Search results */}
      {searchQuery.trim().length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] font-bold uppercase text-text-muted tracking-wider">
            {labels.searchResults}
          </h3>
          {isSearching ? (
            <div className="text-xs text-text-muted text-center py-4">{labels.searching}</div>
          ) : searchResults.length === 0 ? (
            <div className="text-xs text-text-muted text-center py-4">{labels.noAthletes}</div>
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
                      className={cn(
                        'p-2 rounded-lg',
                        isFollowing
                          ? 'bg-bg-surface-hover text-text-muted'
                          : 'bg-primary text-black',
                      )}
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

      {searchQuery.trim().length === 0 && (
        <div className="flex flex-col gap-6">
          {activeTab === 'discovery' && suggestedUsers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">
                {labels.suggested}
              </h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {suggestedUsers.map((u) => (
                  <motion.div
                    key={u.uid}
                    whileHover={{ y: -4 }}
                    className="flex-shrink-0 w-36 glass-card rounded-3xl p-4 border border-border/40 flex flex-col items-center text-center gap-3"
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
                    <p className="text-[11px] font-black text-text-primary truncate w-full">
                      {u.displayName}
                    </p>
                    <div className="flex items-center gap-1">
                      <Award className="h-2.5 w-2.5 text-warning" />
                      <span className="text-[8px] text-text-muted font-black uppercase tracking-widest">
                        Athlete
                      </span>
                    </div>
                    <button
                      onClick={() => handleFollowToggle(u.uid)}
                      className={cn(
                        'w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest',
                        following.includes(u.uid)
                          ? 'bg-bg-surface text-text-muted border border-border'
                          : 'bg-primary text-black border border-primary',
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

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">
              {labels.trendingTags}
            </h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_HASHTAGS.map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-bg-surface border border-border/40 text-xs font-bold text-text-muted hover:text-primary hover:border-primary/40"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase text-text-muted tracking-wider">
              {labels.recentActivity}
            </h3>
            {activeTab === 'following' && (
              <span className="text-[9px] text-text-muted/50 uppercase tracking-widest font-mono">
                {following.length} {labels.followingCount}
              </span>
            )}
          </div>

          {isSocialLoading ? (
            <div className="flex flex-col gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : displayedPosts.length === 0 ? (
            <DataEmptyState
              imageSrc={emptyWorkoutImg}
              title={labels.feedQuiet}
              description={labels.feedQuietDesc}
            />
          ) : (
            displayedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isAr={isAr}
                labels={labels}
                following={following}
                comments={comments[post.id] || []}
                currentUserId={user.uid}
                commentsExpanded={!!expandedComments[post.id]}
                newCommentValue={newComment[post.id] || ''}
                onKudos={giveKudos}
                onFollow={handleFollowToggle}
                onShare={handleSharePost}
                onEdit={(p) => {
                  setEditingPostId(p.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDelete={deletePost}
                onToggleComments={toggleComments}
                onCommentChange={(id, v) => setNewComment((prev) => ({ ...prev, [id]: v }))}
                onCommentSubmit={handleCommentSubmit}
                onVotePoll={(pid, idx, uid) => votePoll(pid, idx, uid)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2',
        active
          ? 'bg-bg-elevated text-primary shadow-lg border border-primary/10'
          : 'text-text-muted hover:text-text-primary',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
