import type { FeedPost } from '@/services/socialService';

/** Humanize a duration for the feed ("45 min" / "٤٥ د"). */
export function formatDuration(seconds: number, isAr: boolean): string {
  const m = Math.floor(seconds / 60);
  return isAr ? `${m} د` : `${m} min`;
}

/** Compact volume with k-suffix ("1.5k kg" / "1.5 طن"). */
export function formatVolume(volume: number, isAr: boolean): string {
  if (isAr) {
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)} طن`;
    return `${volume} كجم`;
  }
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k kg`;
  return `${volume} kg`;
}

interface PostExerciseStub {
  exerciseId: string;
  exerciseName: string;
  setsCount: number;
  imageUrl: string;
}

/**
 * Exercise thumbnails shown on a workout post. Uses the post's own data when
 * present, otherwise falls back to three famous lifts so the card never looks
 * empty. This is a read-only view concern, kept here so the page stays thin.
 */
export function getPostExercises(
  post: FeedPost,
  isAr: boolean,
): Array<{ exerciseId: string; exerciseName: string; setsCount: number; imageUrl: string }> {
  if (post.exercises && post.exercises.length > 0) return post.exercises;
  const fallback: PostExerciseStub[] = [
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
  return fallback.slice(0, post.exercisesCount || 3);
}
