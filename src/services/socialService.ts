/**
 * Social service — Firestore-backed feed, follows, comments, profiles.
 *
 * Firestore (≈400kb) is only needed when these methods actually run. Because
 * this module is statically imported by useSocialStore — which is touched by
 * the home page — we dynamically import both the firestore functions and the
 * db instance. That keeps firestore in its own lazy chunk (bundle-defer-third-party).
 */
import { uid } from '@/utils/id';

// Re-export domain-facing types.
export type { PublicProfile, FeedPost, PostComment } from './socialTypes';
import type { FeedPost, PublicProfile, PostComment } from './socialTypes';

function sanitizeData<T>(data: T): T {
  if (data === null || data === undefined) return data;
  return JSON.parse(JSON.stringify(data));
}

/** Lazily resolve the Firestore instance plus the functions we use. */
async function fs() {
  const [{ getDb }, firestore] = await Promise.all([
    import('@/lib/firebase'),
    import('firebase/firestore'),
  ]);
  return { db: await getDb(), ...firestore };
}

export const socialService = {
  async updatePublicProfile(uid: string, displayName: string, photoURL: string | null) {
    const { db, doc, setDoc, serverTimestamp } = await fs();
    await setDoc(
      doc(db, 'publicProfiles', uid),
      { uid, displayName, photoURL, updatedAt: serverTimestamp() },
      { merge: true },
    );
  },

  async searchUsers(searchQuery: string): Promise<PublicProfile[]> {
    if (!searchQuery) return [];
    const { db, query, collection, where, limit, getDocs } = await fs();
    const q = query(
      collection(db, 'publicProfiles'),
      where('displayName', '>=', searchQuery),
      where('displayName', '<=', searchQuery + '\uf8ff'),
      limit(20),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as PublicProfile);
  },

  async getProfile(uid: string): Promise<PublicProfile | null> {
    const { db, doc, getDoc } = await fs();
    const snap = await getDoc(doc(db, 'publicProfiles', uid));
    return snap.exists() ? (snap.data() as PublicProfile) : null;
  },

  async followUser(currentUid: string, targetUid: string) {
    const { db, doc, setDoc, serverTimestamp } = await fs();
    await setDoc(doc(db, `follows/${currentUid}/following`, targetUid), {
      followedAt: serverTimestamp(),
    });
  },

  async unfollowUser(currentUid: string, targetUid: string) {
    const { db, doc, deleteDoc } = await fs();
    await deleteDoc(doc(db, `follows/${currentUid}/following`, targetUid));
  },

  async getFollowingList(currentUid: string): Promise<string[]> {
    const { db, query, collection, getDocs } = await fs();
    const snap = await getDocs(query(collection(db, `follows/${currentUid}/following`)));
    return snap.docs.map((d) => d.id);
  },

  async publishWorkout(post: Omit<FeedPost, 'id' | 'createdAt' | 'kudosCount'>) {
    const { db, doc, collection, setDoc } = await fs();
    const ref = doc(collection(db, 'feedPosts'));
    await setDoc(
      ref,
      sanitizeData({ ...post, id: ref.id, kudosCount: 0, createdAt: new Date().toISOString() }),
    );
  },

  async getFeed(followingUids: string[]): Promise<FeedPost[]> {
    if (followingUids.length === 0) return [];
    const { db, query, collection, where, limit, getDocs } = await fs();
    const all: FeedPost[] = [];
    // Firestore 'in' supports up to 10 values; chunk to stay safe.
    for (let i = 0; i < followingUids.length; i += 10) {
      const chunk = followingUids.slice(i, i + 10);
      const q = query(collection(db, 'feedPosts'), where('authorUid', 'in', chunk), limit(50));
      const snap = await getDocs(q);
      snap.docs.forEach((d) => all.push(d.data() as FeedPost));
    }
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addKudos(postId: string) {
    const { db, doc, updateDoc, increment } = await fs();
    await updateDoc(doc(db, 'feedPosts', postId), { kudosCount: increment(1) });
  },

  async votePoll(postId: string, optionIndex: number, userUid: string) {
    const { db, doc, getDoc, updateDoc } = await fs();
    const ref = doc(db, 'feedPosts', postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const post = snap.data() as FeedPost;
    if (!post.poll) return;
    const newOptions = post.poll.options.map((opt, idx) => {
      const voters = opt.voters || [];
      if (idx === optionIndex && !voters.includes(userUid)) {
        return { ...opt, votes: opt.votes + 1, voters: [...voters, userUid] };
      }
      return opt;
    });
    await updateDoc(ref, { 'poll.options': newOptions });
  },

  async createPost(post: Omit<FeedPost, 'id' | 'createdAt' | 'kudosCount'>) {
    const { db, doc, setDoc } = await fs();
    const id = uid();
    await setDoc(
      doc(db, 'feedPosts', id),
      sanitizeData({ ...post, id, kudosCount: 0, createdAt: new Date().toISOString() }),
    );
    return id;
  },

  async updatePost(postId: string, updates: Partial<FeedPost>) {
    const { db, doc, updateDoc } = await fs();
    await updateDoc(
      doc(db, 'feedPosts', postId),
      sanitizeData({ ...updates, updatedAt: new Date().toISOString() }),
    );
  },

  async deletePost(postId: string) {
    const { db, doc, deleteDoc, collection, query, where, getDocs, writeBatch } = await fs();
    await deleteDoc(doc(db, 'feedPosts', postId));
    const q = query(collection(db, 'postComments'), where('postId', '==', postId));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  },

  async addComment(postId: string, comment: Omit<PostComment, 'id' | 'createdAt'>) {
    const { db, doc, setDoc } = await fs();
    const id = uid();
    await setDoc(
      doc(db, 'postComments', id),
      sanitizeData({ ...comment, id, postId, createdAt: new Date().toISOString() }),
    );
  },

  async getComments(postId: string): Promise<PostComment[]> {
    const { db, query, collection, where, orderBy, getDocs } = await fs();
    const q = query(
      collection(db, 'postComments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as PostComment);
  },

  async getGlobalFeed(limitCount = 20): Promise<FeedPost[]> {
    const { db, query, collection, orderBy, limit, getDocs } = await fs();
    const q = query(collection(db, 'feedPosts'), orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as FeedPost);
  },

  async getSuggestedUsers(currentUserId: string, limitCount = 5): Promise<PublicProfile[]> {
    const { db, query, collection, where, limit, getDocs } = await fs();
    const q = query(
      collection(db, 'publicProfiles'),
      where('uid', '!=', currentUserId),
      limit(limitCount),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as PublicProfile);
  },
};
