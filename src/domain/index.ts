/**
 * Domain layer — pure types and computations, independent of any framework.
 *
 * This is the deep core of the app: the database repositories in `src/db/`
 * and the React stores in `src/store/` depend on these functions, never the
 * other way around.
 */
export * from './types';
export * from './workoutMath';
export * from './workoutAnalytics';
