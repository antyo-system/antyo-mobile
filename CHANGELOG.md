# Project Tracker

## 🐛 Bugs Log
| ID | Date | Description | Status |
|---|---|---|---|
| BUG-01 | 2026-06-05 | App crashes on launch (Play Store) with `NoClassDefFoundError: ... ComposeViewFunctionDefinitionBuilder` | Investigating / Fix deployed to next build |

## ✨ New Features & Fixes
| Date | Feature | Notes |
|---|---|---|
| 2026-06-12 | v1.9.0 Release | Features: Timeline Feature Parity (Drag-and-Drop date shifting, 'Eye' mode split-view with Real Sessions, Mark as Done, Quick Actions Modal) and Timeline Reminders. |
| 2026-06-11 | v1.8.0 Release | Features: Project Management Hub in Mastery Tab and 'On the Radar' early warning system for upcoming milestones in Calendar tab. |
| 2026-06-11 | v1.7.3 Release | Features: Smart Plan Reminders (Native OS Notifications using expo-notifications) and Inline Task Scheduler from the Plan Quick Action Modal. |
| 2026-06-11 | v1.7.2 Release | Bugfixes: Fixed Donut chart SVG rendering artifacts on Android release builds and missing translation types. |
| 2026-06-10 | v1.7.1 Release | Strict Tracking UX: The REAL calendar column is now read-only for manual creation. Moved 'Eye' compare toggle to the sticky bottom bar. Fixed calendar freeze bug after dragging timeblocks. Fixed missing bottom Navbar on web/localhost. |
| 2026-06-09 | v1.7.0 Release | Added Task/To-Do list feed in Calendar. Added one-tap Task Scheduling Modal. Added Zen Mode (curtain toggle). Added interactive calendar tutorial. Refined translations for 'All Day' and 'Link to Skill'. Fixed PlanEditor UI alignments. |
| 2026-06-05 | UI Simplification | Removed CircularTimer for a cleaner Focus UI. |
| 2026-06-05 | Navigation Bugfix | Fixed Android `KeyboardAvoidingView` crashes in Mastery and Focus modals. |
| 2026-06-05 | Inline Skill CRUD | Added Manage Mode in Focus tab's Assign Skill modal to Create, Edit, and Delete skills inline. |
| 2026-06-05 | ProGuard/R8 Enabled | Added `expo-build-properties` to shrink app size and generate mapping files for Google Play |
| 2026-06-09 | v1.6.1 Release | Bugfixes: Fixed background timer drift, screen sleep pausing timer (`expo-keep-awake`), banner text wrapping, and missing translation keys. |
| 2026-06-09 | v1.6.0 Release | Smart Routine Banner with Dynamic Time Calculation and Soft Overlap Warnings for Plan vs Reality sync. Fixed Translation hook issues. |
| 2026-06-07 | v1.5.1 Release | Timer Settings UI tweaks: Bottom sheet naturally expands without scrolling and scales perfectly on all devices. |
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
