# Contributing to ReLift

Thanks for helping improve ReLift. This document is the source of truth for how
code should be written in this repo. CI enforces the mechanical parts; the rest
is guidance.

## Getting started

```bash
nvm use            # pins Node 20 (see .nvmrc)
npm install
cp .env.example .env
npm run dev        # http://localhost:3000
```

## Quality gates

Every PR must pass, locally and in CI:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint 9 (flat config)
npm run test        # Vitest
npm run build       # production build
```

Pre-commit runs `lint-staged` (ESLint + Prettier) on staged files via Husky.

> The CI workflow lives at `docs/ci/ci.yml.example` because the GitHub App
> lacks `workflows` write permission. Copy it to `.github/workflows/ci.yml`
> in a push you author yourself to enable CI.

## Architecture rules

- **Domain logic is pure.** Keep calculations (volume, streak, 1RM) in
  `src/domain/` — no React, no DB, no side effects. These modules are deep:
  a small interface over real logic, and they are the first thing we test.
- **Hide Dexie behind repositories.** Don't spread
  `db.workoutSessions.where(...).equals(1)...` across pages. Put that behind a
  repository method so callers depend on an interface, not the query shape.
- **No `as any` in `src/domain/`, `src/db/`, or `server/`.** It's tolerated
  elsewhere temporarily but flagged by lint.
- **Pages stay under ~400 lines.** Extract sections into `src/components/`.
- **Translations go through `useTranslation()`** — never inline `isAr ?` in JSX.

## Performance

We follow `vercel-react-best-practices`. Key ones:

- Lazy-load heavy routes (Nutrition, Feed, Stats) — `bundle-dynamic-imports`.
- Parallelize independent fetches with `Promise.all` — `async-parallel`.
- Use `content-visibility: auto` for long lists.
- Don't subscribe a component to state it only uses in a callback.

## Design & accessibility

Follow `frontend-design` (distinctive identity, not the dark+acid-green default)
and `web-design-guidelines` (44px touch targets, visible focus, reduced motion,
contrast).

## Commits

Small, focused commits. Reference the issue/PR. Don't commit generated files
(`dist/`, `coverage/`) or `.env`.
