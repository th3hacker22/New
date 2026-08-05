import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  lazyRouteComponent,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import Layout from "@/components/layout/Layout";
import HomePage from "@/pages/HomePage";
import WorkoutSessionPage from "@/pages/WorkoutSessionPage";
import AuthPage from "@/pages/AuthPage";
import { AuthGuard } from "@/components/AuthGuard";
import { WorkoutProvider } from "@/components/WorkoutProvider";
import AppSkeletonLoader from "@/components/extras/AppSkeletonLoader";

// ── Lazy loaded heavy pages (bundle-dynamic-imports) ──
const ExercisesPage = lazy(() => import("@/pages/ExercisesPage"));
const ExerciseDetailPage = lazy(() => import("@/pages/ExerciseDetailPage"));
const StatsPage = lazy(() => import("@/pages/StatsPage"));
const BodyPage = lazy(() => import("@/pages/BodyPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const BuilderPage = lazy(() => import("@/pages/BuilderPage"));
const WizardPage = lazy(() => import("@/pages/WizardPage"));
const WorkoutResultView = lazy(() => import("@/pages/WorkoutResultView"));
const NutritionPage = lazy(() => import("@/pages/NutritionPage"));
const FeedPage = lazy(() => import("@/pages/FeedPage"));

function LazyWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<AppSkeletonLoader />}>{children}</Suspense>;
}

const rootRoute = createRootRoute({
  component: () => (
    <AuthGuard>
      <WorkoutProvider>
        <Layout>
          <Outlet />
          {/* ScreenCaptureGuard removed - false sense of security */}
        </Layout>
      </WorkoutProvider>
    </AuthGuard>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const builderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/builder",
  component: () => <LazyWrapper><BuilderPage /></LazyWrapper>,
});

const exercisesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/exercises",
  component: () => <LazyWrapper><ExercisesPage /></LazyWrapper>,
});

const exerciseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/exercises/$exerciseId",
  component: () => <LazyWrapper><ExerciseDetailPage /></LazyWrapper>,
});

const workoutSessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/workout/$sessionId",
  component: WorkoutSessionPage,
});

const statsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/stats",
  component: () => <LazyWrapper><StatsPage /></LazyWrapper>,
});

const bodyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/body",
  component: () => <LazyWrapper><BodyPage /></LazyWrapper>,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => <LazyWrapper><ProfilePage /></LazyWrapper>,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => <LazyWrapper><SettingsPage /></LazyWrapper>,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const nutritionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nutrition",
  component: () => <LazyWrapper><NutritionPage /></LazyWrapper>,
});

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/feed",
  component: () => <LazyWrapper><FeedPage /></LazyWrapper>,
});

const wizardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wizard",
  component: () => <LazyWrapper><WizardPage /></LazyWrapper>,
});

const resultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/generator/result",
  component: () => <LazyWrapper><WorkoutResultView /></LazyWrapper>,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  builderRoute,
  exercisesRoute,
  exerciseDetailRoute,
  workoutSessionRoute,
  statsRoute,
  bodyRoute,
  profileRoute,
  settingsRoute,
  authRoute,
  nutritionRoute,
  feedRoute,
  wizardRoute,
  resultRoute,
]);

export const router = createRouter({
  routeTree,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
