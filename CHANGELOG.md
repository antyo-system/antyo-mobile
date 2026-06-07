# Project Tracker

## 🐛 Bugs Log
| ID | Date | Description | Status |
|---|---|---|---|
| BUG-01 | 2026-06-05 | App crashes on launch (Play Store) with `NoClassDefFoundError: ... ComposeViewFunctionDefinitionBuilder` | Investigating / Fix deployed to next build |

## ✨ New Features & Fixes
| Date | Feature | Notes |
|---|---|---|
| 2026-06-05 | UI Simplification | Removed CircularTimer for a cleaner Focus UI. |
| 2026-06-05 | Navigation Bugfix | Fixed Android `KeyboardAvoidingView` crashes in Mastery and Focus modals. |
| 2026-06-05 | Inline Skill CRUD | Added Manage Mode in Focus tab's Assign Skill modal to Create, Edit, and Delete skills inline. |
| 2026-06-05 | ProGuard/R8 Enabled | Added `expo-build-properties` to shrink app size and generate mapping files for Google Play |
| 2026-06-07 | v1.5.0 Release | Pomodoro Chaining, Session Auto-Play, Redesigned Timer Settings Bottom Sheet, and Session Complete Animated Overlays. |
| 2026-06-07 | v1.4.0 Release | Quick Life Logging ('Mark as Done'), Lock Schedule Mode, and Manual Session Editor directly from Calendar. |
| 2026-06-07 | v1.3.0 Release | Streamlined UI: Removed redundant progress bars and profile info for a cleaner mastery and settings experience. |


## 🚀 Updates & Refactors
| Date | Update | Notes |
|---|---|---|
| 2026-06-05 | Navigation Fix | Fixed TypeScript error in `GlobalReminderOverlay.tsx` |
| 2026-06-05 | Dependency Sync | Ran `npx expo install --fix` to fix `@react-navigation/native` SDK mismatch |
| 2026-06-05 | AGENTS.md Sync | Updated `AGENTS.md` to follow global `GEMINI.md` rules and 5-step algorithm |
| 2026-06-07 | Architecture | Created `FEATURE_LIST.md` to track true app state and synced `ROADMAP_100M.md`. |
| 2026-06-07 | Storage Migration | Migrated core documentation to reflect `expo-file-system` as the main data persistence layer instead of MMKV. |
