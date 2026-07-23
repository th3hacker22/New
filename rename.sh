#!/bin/bash
for file in src/components/workout/ShareCard.tsx \
            src/components/extras/SupportAndBot.tsx \
            src/components/extras/ScreenCaptureGuard.tsx \
            src/components/ErrorBoundary.tsx \
            src/components/layout/Layout.tsx \
            src/pages/HomePage.tsx \
            src/pages/ProfilePage.tsx \
            src/pages/SettingsPage.tsx \
            src/pages/StatsPage.tsx \
            src/store/useWorkoutStore.ts; do
  sed -i 's/\bPulse\b/ReLift/g' "$file"
  sed -i 's/\bPULSE\b/RELIFT/g' "$file"
done

# Also handle "pulse" in localstorage keys/variables just for consistency if we want, but let's stick to user-facing strings primarily.
# Actually the prompt says "محتاجين نغير الاسم ونعمل لوجو باسم ReLift" -> "We need to change the name and make a logo with the name ReLift".
