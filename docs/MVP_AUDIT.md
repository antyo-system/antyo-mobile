# 🔍 ANTYO Focus — MVP to Live Product Audit

> Audited against: codebase v1.7.2, all docs (`AGENTS.md`, `ROADMAP_100M.md`, `FEATURE_LIST.md`, `prd.md`, `project-checklist.md`, `upcoming_idea.md`, `tech-stack.md`), all Zustand stores, all screens, all utils, and `app.json`/`eas.json`.

---

## Summary

| Priority | Count | Description |
|----------|-------|-------------|
| 🔴 Critical (Ship-blockers) | 5 | Data loss risks, crash recovery, missing store versioning |
| 🟠 High (Launch essentials) | 7 | App Store readiness, analytics, rate-my-app, accessibility |
| 🟡 Medium (Quality bar) | 6 | Code hygiene, test coverage, UX polish |
| 🟢 Nice-to-have (Post-launch) | 4 | Growth engine, future features |

---

## 🔴 Critical — Must Fix Before Going Live

### 1. No Data Import/Restore
- **Where**: [profile.tsx](file:///d:/01_Projects/Personal%20Projects/antyomobile/src/app/profile.tsx) — Export exists (`handleExportData`), but **there is zero import/restore functionality**.
- **Risk**: If a user exports their 10,000-hour data, switches phones, and tries to restore — they can't. This is the single biggest churn risk for a mastery-tracking app. Your roadmap (`ROADMAP_100M.md` Phase 1) explicitly calls for "Local Data Export/Import (JSON)".
- **Fix**: Add an "Import Backup" button that reads the `.txt` file via `DocumentPicker`, parses the JSON, and merges or overwrites the stores.

### 2. No Zustand Store Versioning or Migration
- **Where**: All 6 persisted stores ([usePlanStore](file:///d:/01_Projects/Personal%20Projects/antyomobile/src/store/usePlanStore.ts), [useSessionStore](file:///d:/01_Projects/Personal%20Projects/antyomobile/src/store/useSessionStore.ts), [useMasteryStore](file:///d:/01_Projects/Personal%20Projects/antyomobile/src/store/useMasteryStore.ts), [useTaskStore](file:///d:/01_Projects/Personal%20Projects/antyomobile/src/store/useTaskStore.ts), [useSettingsStore](file:///d:/01_Projects/Personal%20Projects/antyomobile/src/store/useSettingsStore.ts), [useAppStore](file:///d:/01_Projects/Personal%20Projects/antyomobile/src/store/useAppStore.ts))
- **Risk**: None of the stores have a `version` field or `migrate` function. If you add/rename/delete any field in a future update, existing users' persisted data **will silently break or lose fields**. This is a ticking time bomb for a live app.
- **Fix**: Add `version: N` and a `migrate(persistedState, version)` callback to every `persist()` config. Zustand supports this natively.

### 3. No ErrorBoundary
- **Where**: [_layout.tsx](file:///d:/01_Projects/Personal%20Projects/antyomobile/src/app/_layout.tsx) — Your `AGENTS.md` explicitly requires `ErrorBoundary` exports in `_layout.tsx` files. Zero exist.
- **Risk**: Any unhandled JS error will show a raw red error screen in production. Users will think the app crashed permanently.
- **Fix**: Expo Router supports `export function ErrorBoundary()` in layout files. Add a graceful fallback UI with a "Restart App" button.

### 4. IDs Use `Date.now()` Instead of UUIDs
- **Where**: 14 occurrences across the entire codebase (Plans, Sessions, Tasks, Skills, Pillars).
- **Risk**: Your `AGENTS.md` explicitly states: *"All core domain models MUST use UUIDs for identification to ensure seamless synchronization when a backend is eventually introduced."* `Date.now()` can collide if two items are created in the same millisecond (e.g., batch "Mark as Done" operations). This will cause **data corruption** when you add Cloud Sync.
- **Fix**: Use `crypto.randomUUID()` (available in all modern RN runtimes) or install `uuid`.

### 5. `handleDeleteAllData` Only Clears Sessions
- **Where**: [profile.tsx:76-77](file:///d:/01_Projects/Personal%20Projects/antyomobile/src/app/profile.tsx#L76-L77) — `onPress` calls `useSessionStore.getState().clearSessions?.()` only.
- **Risk**: Plans, Tasks, Skills, Pillars, and Settings are NOT deleted. The button label says "Delete Everything" but it doesn't. This is a trust-breaker and a potential GDPR/Privacy issue.
- **Fix**: Also call `usePlanStore`, `useTaskStore`, `useMasteryStore`, `useAppStore`, and `useSettingsStore` clear/reset functions.

---

## 🟠 High — Essential for a Professional Launch

### 6. No Crash Reporting (Sentry/Bugsnag)
- **Status**: Zero crash monitoring. You are flying blind once the app is on the Play Store. If a user hits a fatal error, you will never know.
- **Fix**: Install `@sentry/react-native` (free tier is generous) and wrap the app with `Sentry.init()`.

### 7. No Real Analytics Integration
- **Status**: PostHog is listed in `project-checklist.md` as "[x] Integrated" but **zero PostHog imports or event tracking calls exist anywhere in the codebase**. This is a phantom checkmark.
- **Fix**: Actually install and integrate PostHog (or a lighter alternative) to track core funnel events: `session_completed`, `plan_created`, `skill_created`, `streak_day`, `app_opened`.

### 8. "Rate This App" Points to an Alert, Not the Store
- **Where**: [profile.tsx:541](file:///d:/01_Projects/Personal%20Projects/antyomobile/src/app/profile.tsx#L541) — `Alert.alert(...)` instead of opening the Play Store review flow.
- **Risk**: You are losing the #1 way to get organic Play Store ratings.
- **Fix**: Use `expo-store-review` (`StoreReview.requestReview()`) to trigger the native in-app review dialog. Also consider a smart trigger (e.g., after the 5th completed session).

### 9. Zero Accessibility Labels
- **Status**: Not a single `accessibilityLabel`, `accessibilityRole`, or `accessibilityHint` exists in the entire codebase.
- **Risk**: The app is completely unusable for visually impaired users with screen readers (TalkBack on Android, VoiceOver on iOS). Google Play may flag this during review. It's also ethically important.
- **Fix**: Add `accessibilityLabel` to all interactive elements (buttons, toggles, inputs) at minimum.

### 10. Missing Play Store Deep Link for Rate App
- **Where**: `app.json` has `"scheme": "antyomobile"` but no Play Store URL is configured anywhere.
- **Fix**: Store the Play Store URL as a constant (`https://play.google.com/store/apps/details?id=com.antyo.focus`) and use it in the "Rate App" flow and for future share features.

### 11. No Loading/Splash Guard for Hydration
- **Where**: [useAppStore](file:///d:/01_Projects/Personal%20Projects/antyomobile/src/store/useAppStore.ts) has `_hasHydrated` state, but the root layout **never checks it**.
- **Risk**: On slow devices, the app may render before stores are hydrated, causing flickers or incorrect initial states (e.g., showing onboarding to existing users).
- **Fix**: In `_layout.tsx`, check `_hasHydrated` and show the splash screen / loading state until it's true.

### 12. `expo-notifications` Requires a Rebuild
- **Status**: You just added `expo-notifications` (native module). This cannot be tested in Expo Go.
- **Risk**: First-time users won't get notification permissions prompted correctly if the build doesn't include the native module.
- **Fix**: Run `eas build` for a fresh dev-client or production APK/AAB before releasing.

---

## 🟡 Medium — Quality Bar for a Professional App

### 13. Hardcoded Default Skill Data in Store
- **Where**: [useMasteryStore.ts:41-64](file:///d:/01_Projects/Personal%20Projects/antyomobile/src/store/useMasteryStore.ts#L41-L64) — A "Coding" skill with 120 hours and "React Native" / "Backend API" pillars is hardcoded as the default state.
- **Risk**: Every new user starts with fake data they didn't create. This pollutes their mastery journey and may confuse first-time users.
- **Fix**: Start with an empty array `[]`. If you want guidance, show an "Add your first skill" prompt in the empty state instead.

### 14. Minimal Unit Test Coverage
- **Where**: Only [time.test.ts](file:///d:/01_Projects/Personal%20Projects/antyomobile/src/utils/time.test.ts) exists (3 test cases). Your `AGENTS.md` says: *"Unit tests are MANDATORY for the /src/utils folder."*
- **Missing tests**: `calendar.ts`, `insights.ts`, `mastery.ts`, `streak.ts`, `notifications.ts` — all have zero tests.
- **Fix**: At minimum, add tests for `streak.ts` (streak calculation logic is critical) and `mastery.ts` (level progression math).

### 15. `tech-stack.md` is Out of Date
- Your `tech-stack.md` lists 7 dependencies and mentions "expo-file-system adapter" but the actual `package.json` has 30+ dependencies including `react-native-mmkv`, `expo-haptics`, `expo-keep-awake`, `expo-sharing`, `expo-notifications`, `@gorhom/bottom-sheet`, etc. This doc hasn't been updated since early MVP.

### 16. `prd.md` References Obsolete Architecture
- Lists `react-native-mmkv` as persistence and `StyleSheet` as styling, but the actual codebase uses `expo-file-system` custom adapter and `NativeWind`. This creates confusion for any new contributors or AI agents.

### 17. Changelog Dates Are Dynamic (`new Date()`)
- **Where**: [changelog.ts](file:///d:/01_Projects/Personal%20Projects/antyomobile/src/constants/changelog.ts) — Most entries use `new Date().toISOString().split('T')[0]` which means the date **changes every day the app is opened**, making it impossible for users to know when a version was actually released.
- **Fix**: Hardcode all dates like `"2026-06-11"`.

### 18. Missing Mastery Store `tasks` Field in Export
- **Where**: `handleExportData` in `profile.tsx` exports `sessions`, `plans`, and `settings` — but **does not include** `skills` (mastery data), `tasks`, or `app` store data (tutorial flags). A "full backup" that's missing the user's 10,000 hours data is not a backup.
- **Fix**: Include all stores in the export JSON.

---

## 🟢 Nice-to-Have — Post-Launch Polish

### 19. Smart Notification Scheduling for Recurring Plans
- Current implementation only schedules notifications for the exact `baseDate`. If a plan is recurring (daily, weekly), the notification won't fire on subsequent days.
- **Fix**: When the app opens, iterate over all plans with `isReminderEnabled` and schedule notifications for the next occurrence.

### 20. Haptic Feedback on Notification Tap → Timer Start
- The notification tap currently starts the timer silently. Adding a haptic buzz (`Haptics.impactAsync`) on auto-start would give a premium "it's alive!" feeling.

### 21. Onboarding Skip Button
- The onboarding flow exists but check if users can easily skip it without confusion. Power users don't want tutorials.

### 22. Localized Notification Text
- [notifications.ts](file:///d:/01_Projects/Personal%20Projects/antyomobile/src/utils/notifications.ts) notification `title` and `body` are hardcoded in Indonesian: `"Waktunya Fokus! 🎯"`. Should use the `useTranslation` hook or at minimum a language-aware string.

---

## Recommended Priority Order (for you, the founder)

```
Week 1 (Critical):
  #1 Data Import/Restore
  #2 Store Versioning/Migration  
  #3 ErrorBoundary
  #4 UUID Migration
  #5 Fix Delete All Data

Week 2 (Launch Essentials):
  #6  Crash Reporting (Sentry)
  #8  Real Store Review Flow
  #11 Hydration Guard
  #13 Remove Hardcoded Skill Data
  #17 Fix Changelog Dates
  #18 Fix Export to include ALL stores

Week 3 (Polish & Ship):
  #9  Basic Accessibility Labels
  #14 Add critical unit tests
  #22 Localize notification text
  #7  Analytics (PostHog or similar)
  #15-16 Update stale docs
```

> [!IMPORTANT]
> Items **#1 (Import/Restore)** and **#2 (Store Migration)** are the two most dangerous gaps. Without them, your users can permanently lose their 10,000-hour progress data — the core value proposition of the entire product. Fix these first.
