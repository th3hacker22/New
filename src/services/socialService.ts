import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uid } from "@/utils/id";

export interface PublicProfile {
  uid: string;
  displayName: string;
  photoURL: string | null;
}

export interface FeedPost {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhotoURL: string | null;
  content?: string;
  images?: string[];
  feeling?: { emoji: string; textEn: string; textAr: string };
  location?: string;
  privacy?: "public" | "followers" | "private";
  workoutTitle?: string;
  duration?: number;
  totalVolume?: number;
  exercisesCount?: number;
  kudosCount: number;
  createdAt: string;
  updatedAt?: string;
  exercises?: {
    exerciseId: string;
    exerciseName: string;
    setsCount: number;
    imageUrl: string;
  }[];
  poll?: {
    question: string;
    options: { text: string; votes: number; voters?: string[] }[];
  };
  hashtags?: string[];
}

export interface PostComment {
  id: string;
  postId: string;
  authorUid: string;
  authorName: string;
  authorPhotoURL: string | null;
  content: string;
  createdAt: string;
}

function sanitizeData<T>(data: T): T {
  if (data === null || data === undefined) return data;
  return JSON.parse(JSON.stringify(data));
}

export const socialService = {
  async updatePublicProfile(
    uid: string,
    displayName: string,
    photoURL: string | null,
  ) {
    if (!db) return;
    const ref = doc(db, "publicProfiles", uid);
    await setDoc(
      ref,
      {
        uid,
        displayName,
        photoURL,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  },

  async searchUsers(searchQuery: string): Promise<PublicProfile[]> {
    if (!db || !searchQuery) return [];
    // Basic prefix search using >= and <=
    // Note: Firestore text search is limited, this requires displayName to be exact or prefix.
    const q = query(
      collection(db, "publicProfiles"),
      where("displayName", ">=", searchQuery),
      where("displayName", "<=", searchQuery + "\uf8ff"),
      limit(20),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as PublicProfile);
  },

  async getProfile(uid: string): Promise<PublicProfile | null> {
    if (!db) return null;
    const snap = await getDoc(doc(db, "publicProfiles", uid));
    return snap.exists() ? (snap.data() as PublicProfile) : null;
  },

  async followUser(currentUid: string, targetUid: string) {
    if (!db) return;
    const ref = doc(db, `follows/${currentUid}/following`, targetUid);
    await setDoc(ref, { followedAt: serverTimestamp() });
  },

  async unfollowUser(currentUid: string, targetUid: string) {
    if (!db) return;
    const ref = doc(db, `follows/${currentUid}/following`, targetUid);
    await deleteDoc(ref);
  },

  async getFollowingList(currentUid: string): Promise<string[]> {
    if (!db) return [];
    const q = query(collection(db, `follows/${currentUid}/following`));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.id);
  },

  async publishWorkout(
    post: Omit<FeedPost, "id" | "createdAt" | "kudosCount">,
  ) {
    if (!db) return;
    const ref = doc(collection(db, "feedPosts"));
    const data = sanitizeData({
      ...post,
      id: ref.id,
      kudosCount: 0,
      createdAt: new Date().toISOString(),
    });
    await setDoc(ref, data);
  },

  async getFeed(followingUids: string[]): Promise<FeedPost[]> {
    if (!db) return [];
    // If user follows no one, maybe we show global or nothing?
    // The prompt says "getFeed(followingUids)".
    if (followingUids.length === 0) return [];

    // Firestore 'in' queries are limited to 10 items. We will chunk them if > 10 in a real app.
    // For simplicity, we chunk up to 10 here.
    const chunks = [];
    for (let i = 0; i < followingUids.length; i += 10) {
      chunks.push(followingUids.slice(i, i + 10));
    }

    let allPosts: FeedPost[] = [];

    for (const chunk of chunks) {
      const q = query(
        collection(db, "feedPosts"),
        where("authorUid", "in", chunk),
        // Without an index, we might not be able to orderBy timestamp easily combined with 'in'.
        // So we will sort client-side.
        limit(50),
      );
      const snap = await getDocs(q);
      allPosts = allPosts.concat(snap.docs.map((d) => d.data() as FeedPost));
    }

    return allPosts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async addKudos(postId: string) {
    if (!db) return;
    const ref = doc(db, "feedPosts", postId);
    await updateDoc(ref, {
      kudosCount: increment(1),
    });
  },

  async votePoll(postId: string, optionIndex: number, userUid: string) {
    if (!db) return;
    const ref = doc(db, "feedPosts", postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const post = snap.data() as FeedPost;
    if (!post.poll) return;

    const newOptions = post.poll.options.map((opt, idx) => {
      const voters = opt.voters || [];
      const hasVoted = voters.includes(userUid);
      if (idx === optionIndex) {
        if (!hasVoted) {
          return { ...opt, votes: opt.votes + 1, voters: [...voters, userUid] };
        }
      }
      return opt;
    });

    await updateDoc(ref, {
      "poll.options": newOptions,
    });
  },

  async createPost(post: Omit<FeedPost, "id" | "createdAt" | "kudosCount">) {
    if (!db) return;
    const id = uid();
    const newPost: FeedPost = sanitizeData({
      ...post,
      id,
      kudosCount: 0,
      createdAt: new Date().toISOString(),
    });
    await setDoc(doc(db, "feedPosts", id), newPost);
    return id;
  },

  async updatePost(postId: string, updates: Partial<FeedPost>) {
    if (!db) return;
    const cleanUpdates = sanitizeData({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, "feedPosts", postId), cleanUpdates);
  },

  async deletePost(postId: string) {
    if (!db) return;
    await deleteDoc(doc(db, "feedPosts", postId));
    
    // Cleanup comments
    const q = query(collection(db, "postComments"), where("postId", "==", postId));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  },

  async addComment(postId: string, comment: Omit<PostComment, "id" | "createdAt">) {
    if (!db) return;
    const id = uid();
    const cleanComment = sanitizeData({
      ...comment,
      id,
      postId,
      createdAt: new Date().toISOString(),
    });
    await setDoc(doc(db, "postComments", id), cleanComment);
  },

  async getComments(postId: string): Promise<PostComment[]> {
    if (!db) return [];
    const q = query(
      collection(db, "postComments"),
      where("postId", "==", postId),
      orderBy("createdAt", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as PostComment);
  },

  async getGlobalFeed(limitCount = 20): Promise<FeedPost[]> {
    if (!db) return [];
    const q = query(
      collection(db, "feedPosts"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as FeedPost);
  },

  async getSuggestedUsers(currentUserId: string, limitCount = 5): Promise<PublicProfile[]> {
    if (!db) return [];
    const q = query(
      collection(db, "publicProfiles"),
      where("uid", "!=", currentUserId),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as PublicProfile);
  },
};
