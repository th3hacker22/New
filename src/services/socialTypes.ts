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
  privacy?: 'public' | 'followers' | 'private';
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
