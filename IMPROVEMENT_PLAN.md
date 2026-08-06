# خطة التحسين الشاملة - ReLift v2.0 Roadmap
> التاريخ: 2026-08-05 | الحالة الحالية: بعد إصلاحات P0 (Server Secured, Modularized, Lazy-loaded)

## 0) الملخص التنفيذي

**الهدف**: تحويل ReLift من MVP يعمل إلى منتج **Production-Ready لـ 10k+ مستخدم** مع:
- تجربة عربية ممتازة (i18n مركزي + لهجة مصرية)
- Accessibility ≥95 Lighthouse
- PWA حقيقي Offline-First
- Test Coverage ≥70%
- Bundle <500kb initial

**المهارات المستخدمة**:
- `vercel-react-best-practices` (608K) - أداء
- `frontend-design` (744K) - تميّز بصري
- `web-design-guidelines` (518K) - a11y
- `improve-codebase-architecture` (623K) - معمارية
- `tdd` (601K) - اختبارات (مقترح تثبيت)
- `find-skills` (2.8M) - اكتشاف مهارات

**المدة المقترحة**: 3 أسابيع (15 يوم عمل)

---

## 1) التشخيص الحالي بعد P0

| المحور | قبل P0 | بعد P0 | المتبقي |
|---|---|---|---|
| HomePage | 1488 سطر God | 285 سطر + 7 مكونات | ✅ ممتاز |
| StatsPage | 2613 سطر God | 280 سطر + 5 tabs | ✅ ممتاز |
| Bundle | 720kb sync | manualChunks + lazy (تقديري 350kb initial) | ⚠️ يحتاج قياس Lighthouse |
| Security | 5 ثغرات حرجة | مقفولة (rate-limit, firestore rules) | ⚠️ يحتاج AppCheck + CSP + zod |
| Storage | 15 مفتاح عشوائي | storage.ts مركزي | ✅ لكن بعض extras لا تزال legacy |
| i18n | `isAr ? : ` في كل ملف (Shotgun Surgery) | لا يزال موجود | ❌ لم يبدأ |
| A11y | touch 28px, لا focus-visible | لم يبدأ | ❌ |
| Testing | 0% | 0% | ❌ |
| PWA | manifest JPG + لا SW config | لم يبدأ | ❌ |

---

## المرحلة 1: نظام الترجمة المركزي (i18n) - 3 أيام
### الهدف: حل Shotgun Surgery + توحيد اللهجة المصرية

**المشكلة الحالية**:
```tsx
// يتكرر في 12 ملف
const t = { welcome: isAr ? "أهلاً" : "Welcome", ... }
```
تعديل كلمة واحدة = تعديل 12 ملف.

**التنفيذ**:
1. إنشاء `src/i18n/`:
   ```
   src/i18n/
   ├── index.ts          // useTranslation hook + provider
   ├── ar.json           // عربية فصحى
   ├── eg.json           // عامية مصرية (اللهجة الحالية)
   ├── en.json           // انجليزية
   └── types.ts          // TranslationKeys type safety
   ```
2. Hook:
   ```ts
   export function useT() {
     const lang = useSettingsStore(s => s.language) // ar | eg | en
     const dict = lang === 'ar' ? ar : lang === 'eg' ? eg : en
     return (key: keyof typeof en) => dict[key] || key
   }
   ```
3. Migration تدريجي:
   - اليوم 1: HomePage + Layout
   - اليوم 2: StatsPage tabs + Nutrition
   - اليوم 3: Profile, Builder, Exercises
4. إضافة `egyptianGymDictionary` كـ plugin للـ i18n بدل دالة منفصلة

**المهارة**: `improve-codebase-architecture` - فصل الاهتمامات

**معايير القبول**:
- [ ] لا يوجد `isAr ?` مباشر في الصفحات (فقط في i18n/index.ts)
- [ ] `npm run lint` يكشف استخدام `isAr` خارج i18n
- [ ] تبديل اللغة لا يسبب rerender كامل (useMemo للـ dict)

**الجهد**: 3 أيام | **الاعتماد**: لا يوجد

---

## المرحلة 2: نظام التصميم والوصولية (Design System + A11y) - 4 أيام
### الهدف: Lighthouse Accessibility 95+ + Signature بصري مميز

**المهارتين**: `frontend-design` + `web-design-guidelines`

**2.1 Design Tokens** (يوم 1):
- إنشاء `src/design/tokens.ts`:
  ```ts
  export const radii = { card: '22px', pill: '999px', brutal: '4px' }
  export const shadows = { glowPrimary: '0 0 20px rgba(204,255,0,0.3)' }
  ```
- توحيد كل `rounded-[22px]` إلى `var(--radius-card)`

**2.2 Signature Risk - اقتراح Brutalist Gym** (يوم 1):
حالياً كل الكروت glass-card متشابهة (generic). الاقتراح:
- كروت التمارين: زوايا مقصوصة `clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)` + border سميك 2px
- باقي UI يبقى minimal - التركيز على عنصر واحد مميز
- تطبيق على `QuickRoutinesGrid` و `ExerciseWorkoutCard`

**2.3 Accessibility** (يومان):
- **Touch Targets**: `SetRow` من 28px → 44px, `BottomNav` icons من 22px → 24px مع padding 12px
- **Focus**: إضافة `focus-visible:ring-2 ring-primary ring-offset-2` لكل Button, Input, Select
- **Aria**: `aria-label` لكل input وزن/تكرار, `aria-live` للـ Toast, `role="tablist"` لتبويبات Stats
- **Reduced Motion**: 
  ```ts
  const shouldReduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  // في framer-motion: transition={shouldReduceMotion ? {duration:0} : {...}}
  ```
- **Contrast**: فحص `text-muted` على `bg-surface` عبر APCA - زيادة opacity من 0.6 إلى 0.75

**2.4 Typography** (نصف يوم):
- استبدال `Inter` + `JetBrains Mono` (generic) بـ `Space Grotesk` display + `Geist Mono` للـ mono
- إضافة font-display: swap

**معايير القبول**:
- [ ] Lighthouse Accessibility ≥95
- [ ] كل interactive element ≥44×44px (تحقق عبر DevTools)
- [ ] التنقل بالـ Tab يعمل 100% بدون فأرة
- [ ] `prefers-reduced-motion` يحترم

**الجهد**: 4 أيام | **الاعتماد**: بعد Phase 1 (حتى لا نكرر الترجمة)

---

## المرحلة 3: PWA حقيقي Offline-First - يومان
### الهدف: تعمل 100% بدون إنترنت لتسجيل التمارين

**الحالي**:
- `manifest.json` يشير لـ JPG كأيقونة
- `vite-plugin-pwa` موجود لكن بدون config

**التنفيذ**:
1. إنشاء أيقونات PNG: 192, 512, maskable 512 عبر `sharp` أو `pwa-asset-generator`
2. `vite.config.ts`:
   ```ts
   VitePWA({
     registerType: 'autoUpdate',
     manifest: { name: 'ReLift', short_name: 'ReLift', theme_color: '#050505', icons: [...] },
     workbox: {
       runtimeCaching: [
         { urlPattern: /^https:\/\/raw\.githubusercontent\.com\/hasaneyldrm\/exercises-dataset/, handler: 'CacheFirst', options: { cacheName: 'exercises-images', expiration: { maxEntries: 500, maxAgeSeconds: 30*24*60*60 } } },
         { urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*\/exercises\.json/, handler: 'StaleWhileRevalidate', options: { cacheName: 'exercises-json' } }
       ]
     }
   })
   ```
3. Offline fallback: `src/pages/OfflinePage.tsx`
4. إستراتيجية Sync: عند العودة online, `syncAll()` تلقائي (موجود لكن يحتاج Background Sync API)

**المهارة**: `vercel-react-best-practices` - `bundle-preload` + resource hints

**معايير القبول**:
- [ ] Lighthouse PWA ≥90
- [ ] تسجيل تمرين offline ثم online → يزامن بدون فقدان
- [ ] عرض صور التمارين offline (cached)

**الجهد**: يومان

---

## المرحلة 4: الاختبار والأمان المتقدم - 3 أيام
### الهدف: Coverage ≥70% + حماية AppCheck + zod

**4.1 تثبيت مهارة TDD**:
```bash
npx skills add mattpocock/skills --skill tdd
```

**4.2 Testing Stack**:
- `vitest`, `@testing-library/react`, `msw` (mock fetch), `playwright`

**الاختبارات المقترحة** (أول 10):
1. `calculateSessionVolume` - وحدة (P0 تم إنشاؤه، يحتاج test)
2. `getWeekKey` - edge cases سنة جديدة
3. `storage.ts` - quota exceeded + migration
4. `egyptianGymDictionary` - ترجمة + cache
5. `useWorkoutStore` - start/finish/cancel flow
6. `HomePage` - render مع demo data
7. `firestore.rules` - Emulator test لـ kudos
8. `server.ts` - rate limit test via supertest
9. `NutritionPage` - water tracking
10. E2E: تسجيل تمرين كامل → حفظ → ظهور في Stats

**4.3 Security Hardening**:
- `zod` schemas لكل API:
  ```ts
  const parseNutritionSchema = z.object({ text: z.string().min(1).max(1000), mealTypeHint: z.enum(['breakfast','lunch','dinner','snack']).optional() })
  ```
- Firebase AppCheck: تفعيل في console + `initializeAppCheck` في `firebase.ts`
- CSP Header في `securityHeaders`: `default-src 'self'; img-src 'self' https://raw.githubusercontent.com data:; connect-src 'self' https://api.github.com`

**معايير القبول**:
- [ ] `npm run test` ≥70% coverage
- [ ] `npm run test:e2e` يمر في CI
- [ ] هجوم `kudosCount: 1000` يفشل في Emulator

**الجهد**: 3 أيام

---

## المرحلة 5: تجربة المطور (DX) و CI/CD - يومان
### الهدف: لا يمكن دفع كود مكسور

**5.1 ESLint + Prettier**:
```bash
npm i -D eslint prettier eslint-plugin-react-hooks eslint-plugin-security
```
- `.eslintrc` مع قواعد: no-explicit-any warn, no-unused-vars, security/detect-object-injection
- `.prettierrc`

**5.2 Husky + lint-staged**:
```json
"lint-staged": { "*.{ts,tsx}": ["eslint --fix", "prettier --write"] }
```

**5.3 GitHub Actions** `.github/workflows/ci.yml`:
- jobs: `typecheck` (tsc), `lint`, `test`, `build`, `e2e` (playwright), `security` (npm audit)
- Cache node_modules

**5.4 حذف الملفات المؤقتة**:
- حذف `fix_*.py`, `translate_*.py`, `update_*.py` (موجودة 15 ملف في الروت) - كانت سكريبتات ترجمة مؤقتة
- نقلها لـ `scripts/` مع `.gitignore` لو لازمة

**معايير القبول**:
- [ ] `git commit` يرفض إذا فيه lint error
- [ ] PR لا يمكن دمجه إلا إذا CI أخضر

**الجهد**: يومان

---

## المرحلة 6: الأداء والمراقبة - يوم واحد
### الهدف: Initial JS <500kb + Web Vitals مراقبة

**6.1 Images**:
- كل `<img>` → `loading="lazy"` + `width/height` ثابتة لمنع CLS + `fetchpriority="high"` لـ LCP only
- استخدام `sharp` لضغط صور `streak_banner_bg` (حالياً كبيرة)
- `srcset` للصور البطولية

**6.2 Rendering**:
- `content-visibility: auto` لـ `WorkoutHistoryList` الطويل (rendering-content-visibility)
- `requestIdleCallback` لحساب `getMuscleGroupStats` الثقيل (js-request-idle-callback)
- `React.memo` لـ `SetRow` موجود لكن نحتاج `useCallback` لـ handlers في `ExerciseWorkoutCard`

**6.3 Monitoring**:
- `web-vitals` + إرسال إلى Firebase Analytics أو Sentry
- Sentry for errors: `Sentry.init({ dsn: ..., tracesSampleRate: 0.2 })`

**معايير القبول**:
- [ ] Lighthouse Performance ≥90 على موبايل 4G
- [ ] LCP <2.5s, CLS <0.1, TBT <200ms
- [ ] Sentry يلتقط خطأ تجريبي

**الجهد**: يوم واحد

---

## الجدول الزمني المقترح (3 أسابيع)

| الأسبوع | الأيام | المراحل | المخرجات |
|---|---|---|---|
| 1 | 1-3 | Phase 1 (i18n) | `src/i18n/` + كل الصفحات تستخدم `useT()` |
| 1 | 4-7 | Phase 2 (Design + A11y) | Tokens + Brutalist cards + A11y 95+ |
| 2 | 8-9 | Phase 3 (PWA) | Manifest PNG + Workbox caching |
| 2 | 10-12 | Phase 4 (Test + Sec) | 10 tests + zod + AppCheck |
| 3 | 13-14 | Phase 5 (DX) | ESLint + Husky + CI |
| 3 | 15 | Phase 6 (Perf) | Lazy images + web-vitals + Sentry |
| 3 | نهاية | Release | v2.0 tag + CHANGELOG |

---

## مصفوفة المخاطر والتخفيف

| الخطر | الاحتمال | التأثير | التخفيف |
|---|---|---|---|
| تغيير i18n يكسر ترجمة موجودة | متوسط | عالي | Migration تدريجي + fallback لـ `eg.json` إذا مفتاح غير موجود |
| PWA caching يخزن صور قديمة | منخفض | متوسط | version للـ cache + زر "Clear Cache" في Settings |
| Tests بطيئة في CI | متوسط | منخفض | استخدام `vitest --run` + cache + شارد للـ e2e فقط على main |
| Brutalist design لا يعجب المستخدم | منخفض | متوسط | A/B test عبر feature flag `isBrutalist` في Settings |

---

## كيف نبدأ الآن؟

### الخيار A - تطوير متوازي (مقترح):
1. أنشئ branch منفصل لكل Phase: `feat/i18n-central`, `feat/a11y-design`, etc.
2. كل Phase PR صغير <500 سطر (سهل Review)
3. بعد كل Phase, `npm run build` + Lighthouse + Manual QA على موبايل حقيقي

### الخيار B - تطوير متسلسل:
ابدأ بـ Phase 1 الآن وأنا أطبقه فوراً.

**أنا جاهز أبدأ بـ Phase 1 (i18n)** إذا وافقت - سأنشئ `src/i18n/` وأنقل ترجمة `HomePage` كمثال، ثم تعميم على الباقي.

تحب أبدأ بأي مرحلة؟ أو تريد تعديل الأولويات؟

---

## الملحق: Checklist شاملة للتنفيذ

### Phase 1
- [ ] إنشاء ar.json, eg.json, en.json (استخراج من t maps الحالية)
- [ ] كتابة useTranslation hook + type safety
- [ ] Migration HomePage + Layout
- [ ] Migration StatsPage + Nutrition

### Phase 2
- [ ] design/tokens.ts
- [ ] Brutalist card style
- [ ] Touch 44px + focus-visible + aria
- [ ] prefers-reduced-motion
- [ ] Space Grotesk font

### Phase 3
- [ ] أيقونات PNG 192/512/maskable
- [ ] VitePWA config
- [ ] OfflinePage

### Phase 4
- [ ] تثبيت tdd skill
- [ ] Vitest + 10 tests
- [ ] zod schemas
- [ ] AppCheck + CSP

### Phase 5
- [ ] ESLint + Prettier
- [ ] Husky
- [ ] CI workflow
- [ ] حذف translate_*.py المؤقتة

### Phase 6
- [ ] loading lazy + srcset
- [ ] content-visibility
- [ ] web-vitals + Sentry
