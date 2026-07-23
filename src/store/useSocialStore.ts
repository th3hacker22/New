import { create } from "zustand";
import {
  socialService,
  FeedPost,
  PublicProfile,
  PostComment,
} from "@/services/socialService";

interface SocialState {
  following: string[];
  feed: FeedPost[];
  searchResults: PublicProfile[];
  isLoading: boolean;
  isSearching: boolean;
  globalFeed: FeedPost[];
  comments: Record<string, PostComment[]>;
  loadFollowing: (uid: string) => Promise<void>;
  loadFeed: () => Promise<void>;
  loadGlobalFeed: () => Promise<void>;
  createPost: (post: Omit<FeedPost, "id" | "createdAt" | "kudosCount">) => Promise<void>;
  updatePost: (postId: string, updates: Partial<FeedPost>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addComment: (postId: string, comment: Omit<PostComment, "id" | "createdAt">) => Promise<void>;
  loadComments: (postId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  follow: (currentUid: string, targetUid: string) => Promise<void>;
  unfollow: (currentUid: string, targetUid: string) => Promise<void>;
  giveKudos: (postId: string) => Promise<void>;
  votePoll: (postId: string, optionIndex: number, userUid: string) => Promise<void>;
  publishSession: (
    uid: string,
    name: string,
    photoURL: string | null,
    summary: {
      workoutTitle: string;
      duration: number;
      totalVolume: number;
      exercisesCount: number;
      exercises?: {
        exerciseId: string;
        exerciseName: string;
        setsCount: number;
        imageUrl: string;
      }[];
    },
  ) => Promise<void>;
  clearState: () => void;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  following: [],
  feed: [],
  searchResults: [],
  isLoading: false,
  isSearching: false,
  globalFeed: [],
  comments: {},

  loadFollowing: async (uid) => {
    try {
      const list = await socialService.getFollowingList(uid);
      set({ following: list });
    } catch (e) {
      console.error("Failed to load following list:", e);
    }
  },

  loadFeed: async () => {
    set({ isLoading: true });
    try {
      const list = get().following;
      const posts = await socialService.getFeed(list);
      set({ feed: posts });
    } catch (e) {
      console.error("Failed to load feed:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  loadGlobalFeed: async () => {
    set({ isLoading: true });
    try {
      const posts = await socialService.getGlobalFeed();
      set({ globalFeed: posts });
    } catch (e) {
      console.error("Failed to load global feed:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  createPost: async (post) => {
    try {
      await socialService.createPost(post);
      await get().loadGlobalFeed();
    } catch (e) {
      console.error("Failed to create post:", e);
    }
  },

  updatePost: async (postId, updates) => {
    try {
      await socialService.updatePost(postId, updates);
      await get().loadGlobalFeed();
    } catch (e) {
      console.error("Failed to update post:", e);
    }
  },

  deletePost: async (postId) => {
    try {
      await socialService.deletePost(postId);
      await get().loadGlobalFeed();
      await get().loadFeed();
    } catch (e) {
      console.error("Failed to delete post:", e);
    }
  },

  addComment: async (postId, comment) => {
    try {
      await socialService.addComment(postId, comment);
      await get().loadComments(postId);
    } catch (e) {
      console.error("Failed to add comment:", e);
    }
  },

  loadComments: async (postId) => {
    try {
      const cms = await socialService.getComments(postId);
      set((state) => ({
        comments: { ...state.comments, [postId]: cms }
      }));
    } catch (e) {
      console.error("Failed to load comments:", e);
    }
  },

  searchUsers: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    set({ isSearching: true });
    try {
      const results = await socialService.searchUsers(query);
      set({ searchResults: results });
    } catch (e) {
      console.error("Failed to search users:", e);
    } finally {
      set({ isSearching: false });
    }
  },

  follow: async (currentUid, targetUid) => {
    try {
      await socialService.followUser(currentUid, targetUid);
      const newFollowing = [...get().following, targetUid];
      set({ following: newFollowing });
      await get().loadFeed();
    } catch (e) {
      console.error("Failed to follow target:", e);
    }
  },

  unfollow: async (currentUid, targetUid) => {
    try {
      await socialService.unfollowUser(currentUid, targetUid);
      const newFollowing = get().following.filter((uid) => uid !== targetUid);
      set({ following: newFollowing });
      set({ feed: get().feed.filter((post) => post.authorUid !== targetUid) });
    } catch (e) {
      console.error("Failed to unfollow target:", e);
    }
  },

  giveKudos: async (postId) => {
    try {
      const feed = get().feed;
      // Optimistic update
      set({
        feed: feed.map((p) =>
          p.id === postId ? { ...p, kudosCount: p.kudosCount + 1 } : p,
        ),
      });
      await socialService.addKudos(postId);
    } catch (e) {
      console.error("Failed to give kudos:", e);
    }
  },

  votePoll: async (postId, optionIndex, userUid) => {
    try {
      // Optimistic update in both feed and globalFeed
      const updatePosts = (posts: FeedPost[]) =>
        posts.map((p) => {
          if (p.id !== postId || !p.poll) return p;
          const options = p.poll.options.map((opt, i) => {
            const voters = opt.voters || [];
            if (i === optionIndex && !voters.includes(userUid)) {
              return { ...opt, votes: opt.votes + 1, voters: [...voters, userUid] };
            }
            return opt;
          });
          return { ...p, poll: { ...p.poll, options } };
        });

      set({
        feed: updatePosts(get().feed),
        globalFeed: updatePosts(get().globalFeed),
      });

      await socialService.votePoll(postId, optionIndex, userUid);
    } catch (e) {
      console.error("Failed to vote in poll:", e);
    }
  },

  publishSession: async (uid, name, photoURL, summary) => {
    try {
      await socialService.publishWorkout({
        authorUid: uid,
        authorName: name,
        authorPhotoURL: photoURL,
        workoutTitle: summary.workoutTitle,
        duration: summary.duration,
        totalVolume: summary.totalVolume,
        exercisesCount: summary.exercisesCount,
        exercises: summary.exercises,
      });
    } catch (e) {
      console.error("Failed to publish workout:", e);
    }
  },

  clearState: () => {
    set({ following: [], feed: [], searchResults: [] });
  },
}));
