# خطة احتراف ReLift (Professionalization Plan)

> التاريخ: 2026-08-06
> الحالة: Phase 0 قيد التنفيذ
> المرجع: IMPROVEMENT_PLAN.md (النسخة القديمة) — هذه الوثيقة تحل محلها بخطة أنضج ومطبّقة على الواقع الحالي للكود.

## 0) المبدأ: المشكلة مش في اللغة

الـ stack الحالي (TypeScript + React 19 + Vite 6 + Tailwind 4 + Zustand + TanStack Router + Dexie + Firebase + Express + Gemini) احترافي بالكامل. العيب في **الانضباط الهندسي** مش في الأدوات. الهدف: رفع المشروع إلى مستوى production-ready بدون هدر الكود الموجود.

### المهارات المستخدمة (Skills)
| المهارة | الدور في الخطة |
|---|---|
| `improve-codebase-architecture` | تحديد الـ shallow modules وتعميقها، تطبيق deletion test والـ seams |
| `vercel-react-best-practices` | 70 قاعدة أداء (waterfalls, bundle, re-render, rendering) |
| `frontend-design` | هوية بصرية مميزة (مش القالب الداكن + الأخضر الحمضي) |
| `web-design-guidelines` | Accessibility، touch targets، contrast |
| `code-review` | مراجعة كل PR على محوري Standards + Spec |

---

## 1) التشخيص الواقعي (بعد مسح الكود)

| # | المشكلة | الدليل | الأثر |
|---|---|---|---|
| 1 | صفر اختبارات | `find . -name "*.test.*"` = لا شيء | أي refactor risk عالي |
| 2 | صفر DX tooling | لا ESLint / Prettier / Husky / CI | كود مكسور يندفع بسهولة |
| 3 | God Components باقية | SettingsPage 1635، FeedPage 1508، NutritionPage 1115، BodyPage 742، ProfilePage 741 | Divergent Change |
| 4 | 30 سكريبت مؤقت في الروت | `fix_*.py`, `translate_*.py`, `update_*.py` | فوضى، يربك أي AI/مطور |
| 5 | `as any` تكسر الـ types | `ar as any`, `eg as any` في i18n | وهم الأمان النوعي |
| 6 | server.ts ملف واحد 493 سطر | routes + validation + AI + security في ملف واحد | shallow module، صعب الاختبار |
| 7 | لا PWA حقيقي | vite-plugin-pwa بدون config، أيقونة JPG | offline-first مكسور |
| 8 | لا Design Tokens موثقة | `rounded-[22px]` متناثر، CSS vars فقط | تناقض بصري |
| 9 | لا error monitoring | لا Sentry ولا analytics | أخطاء الإنتاج عمياء |
| 10 | 13 vulnerabilities | `npm audit` | أمان |

---

## 2) المراحل (الترتيب مقصود — كل مرحلة تعتمد على اللي قبلها)

### Phase 0 — الأساس (DX & Tooling) ← **ننفذها الآن**
- [ ] ESLint 9 (flat config) + typescript-eslint + react-hooks + react-refresh
- [ ] Prettier + التكامل مع ESLint
- [ ] Husky + lint-staged (pre-commit)
- [ ] GitHub Actions CI: typecheck + lint + build
- [ ] Vitest إعداد + اختبار أول للوظائف النقية (analytics helpers)
- [ ] تنظيف الروت: نقل/حذف الـ 30 سكريبت المؤقت
- [ ] ملف `.nvmrc` و `CONTRIBUTING.md`
- **القبول**: `npm run lint && npm run typecheck && npm run test && npm run build` كلها خضراء محلياً وفي CI

### Phase 1 — تعميق الـ Modules (Architecture)
بالاسترشاد بـ `improve-codebase-architecture`:
- [ ] فصل `server.ts` إلى وحدات عميقة: `server/routes/`, `server/validators/`, `server/ai/` (seam: كل route له واجهة واحدة، الـ AI client adapter قابل للاستبدال)
- [ ] إنشاء `src/db/repositories/` — workout repository يخفي تفاصيل Dexie (حل Message Chains الـ 12 مرة)
- [ ] استخراج `src/domain/` — الأنواع النقية (WorkoutSet, BodyMetrics, SetType) + حسابات volume/streak/1RM (حل Data Clumps + Primitive Obsession)
- [ ] تقسيم SettingsPage: مجموعات إعدادات (units, timer, integrations, appearance) كمكونات منفصلة
- [ ] إزالة `as any` من i18n (type-safe keys)
- **القبول**: كل ملف صفحة < 400 سطر، لا `as any` في `src/domain/`

### Phase 2 — الاختبارات (Testing)
- [ ] Unit: domain calculations (volume, streak, getWeekKey, 1RM)
- [ ] Unit: stores (workout flow start/finish/cancel)
- [ ] Integration: db repositories على fake Dexie
- [ ] Server: supertest على الـ routes بعد فصلها
- [ ] مبدئياً 3 اختبارات E2E حرجة (تسجيل تمرين كامل)
- **القبول**: coverage ≥ 70% على `src/domain/` و `src/db/` و `server/`

### Phase 3 — الأداء (Performance)
بالاسترشاد بـ `vercel-react-best-practices`:
- [ ] `bundle-dynamic-imports`: lazy لكل صفحة ثقيلة (Nutrition, Feed, Stats) — التحقق من التحليل
- [ ] `rendering-content-visibility`: WorkoutHistoryList الطويل
- [ ] `js-request-idle-callback`: getMuscleGroupStats الثقيل
- [ ] `client-localstorage-schema`: versioning للـ storage (موجود جزئياً)
- [ ] `rendering-resource-hints`: preconnect لصور التمارين
- [ ] `rerender-*`: فحص الـ stores + useMemo/useCallback في الكروت
- **القبول**: Lighthouse Performance ≥ 90، initial JS < 500kb

### Phase 4 — PWA حقيقي (Offline-First)
- [ ] أيقونات PNG 192/512/maskable
- [ ] Workbox runtime caching لصور الـ exercises dataset
- [ ] Offline fallback page
- [ ] خلفية sync عند العودة أونلاين
- **القبول**: Lighthouse PWA ≥ 90، تسجيل تمرين offline ثم online يزامن

### Phase 5 — التصميم وهوية الوصول (Design & A11y)
بالاسترشاد بـ `frontend-design` و `web-design-guidelines`:
- [ ] Design Tokens في `src/design/tokens.ts` (ألوان، radii، shadows، type scale)
- [ ] هوية بصرية خاصة بـ ReLift (قرار بصري واحد جريء — بعيداً عن الداكن/الأخضر الحمضي النمطي)
- [ ] Touch targets ≥ 44px (SetRow حالياً 28px)
- [ ] focus-visible ring على كل interactive
- [ ] aria-label، role="tablist"، aria-live
- [ ] prefers-reduced-motion
- [ ] فحص contrast (text-muted opacity 0.6 → 0.75)
- **القبول**: Lighthouse A11y ≥ 95، تنقل كامل بالكيبورد

### Phase 6 — الأمان والإنتاج (Security & Production)
- [ ] zod schemas لكل API endpoint
- [ ] Firebase AppCheck
- [ ] CSP header
- [ ] Sentry للأخطاء + web-vitals
- [ ] `npm audit` معالجة
- **القبول**: 0 critical/high vulnerabilities، errors تظهر في Sentry

---

## 3) طريقة العمل

- كل Phase = branch + PR صغير (< 500 سطر)
- كل PR يُراجَع بالمهارة `code-review` (Standards + Spec)
- بعد كل Phase: build + typecheck + test + manual QA
- لا ندفع كود لـ main بدون CI أخضر

## 4) مقاييس النجاح النهائية

| المقياس | الحالي | الهدف |
|---|---|---|
| God components (>800 سطر) | 3 | 0 |
| `as any` في src | منتشر | 0 في domain/db/server |
| Test coverage | 0% | ≥70% للمنطق الحرج |
| Lighthouse Performance | غير مقيس | ≥90 |
| Lighthouse A11y | غير مقيس | ≥95 |
| Lighthouse PWA | غير مقيس | ≥90 |
| ملفات مؤقتة في الروت | 30 | 0 |
| CI | لا يوجد | typecheck+lint+test+build |
