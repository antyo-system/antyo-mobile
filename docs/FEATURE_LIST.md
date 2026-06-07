# ANTYO Focus - Feature Inventory & Checklist

This document serves as the absolute ground truth for features that have been *implemented* versus what is *planned*. 
If a feature is checked here, it exists in the codebase and is fully functional.

## 🎯 1. Core Mastery Engine (10,000 Hours)
- [x] **Skill & Pillar Creation:** Users can create custom skills (e.g., Coding) and sub-categories/pillars (e.g., React Native).
- [x] **Mastery Progress Tracking:** Calculates total hours accumulated across all sessions towards the 10,000 hours goal.
- [x] **Daily Targets:** Users can set a daily target (minutes) per skill. The UI turns orange and shows a flame when met.

## ⏱️ 2. The Focus Engine (Timer)
- [x] **Smart Timer Mode:** Classic countdown timer.
- [x] **Pomodoro Chaining:** Automatically play a break after a focus session, and vice versa using the Auto-Play setting.
- [x] **Stopwatch Mode:** Open-ended count-up timer for flow states.
- [x] **Smart Routine Banner:** Auto-detects if a scheduled routine is active right now and prompts the user to load it.
- [x] **Tutorial Overlay:** Custom Spotlight onboarding for first-time users.
- [x] **Completion Gamification:** Highly satisfying animated overlay (spring bounce + haptic feedback) when finishing a session or leveling up.

## 🗓️ 3. Calendar & Time-Blocking (Plan vs Real)
- [x] **Split View Layout:** Left side (Yellow) for Planned Schedule, Right side (Blue) for Real Executed Sessions.
- [x] **Drag & Drop Planning:** Intuitive gesture-based creation and resizing of time blocks.
- [x] **Automated Routine Engine:** Ability to create recurring schedules (Daily, Weekdays, Specific Days, etc.).
- [x] **Life Logging (Mark as Done):** Non-skill plans can be instantly logged with one click (no timer needed).
- [x] **Manual Session Editing:** Ability to add or edit past 'Real' sessions directly from the calendar.
- [x] **Lock Mode:** A padlock toggle to freeze the calendar and prevent accidental dragging/editing.
- [x] **Task & To-Do List:** Switch to 'Task' mode to manage project-based tasks (`useTaskStore`).

## 📊 4. Gamification & Statistics
- [x] **Global Streaks (🔥):** Calculates consecutive days where the global `dailyFocusTargetHours` is met. Displayed in the Stats tab header.
- [x] **Contribution Heatmap:** GitHub-style daily activity grid to visualize consistency over the year.
- [x] **Weekly Bar Chart:** Compares week-by-week focus hours.
- [x] **Discipline Score:** Percentage score comparing "Planned vs Executed" hours with dynamic AI-like coach feedback.
- [x] **Time Widgets:** Calculates 'Time Left Today' based on user's sleep schedule, and 'Lifetime Countdown'.
- [x] **Smart Mode Analytics:** Breakdowns of pure "Focus" vs "Distracted" time globally.

## 🛠️ 5. Infrastructure & Settings
- [x] **100% Local-First Storage:** Custom `expo-file-system` adapter to ensure Zustand state is never lost on Expo Go/Bare workflow.
- [x] **Settings Control:** Configure sleep schedule (for time widget), global daily focus target, and app tutorials.
- [x] **Data Portability:** Export full data as Backup (TXT) or Sessions to Excel (CSV).
- [x] **Onboarding Flow:** Interactive multi-step tutorial bubbles (`SpotlightOverlay`) across all major tabs.
- [x] **Theme Customization:** Support for System, Light, and Dark Mode.
- [x] **Changelog System:** In-app popup to notify users of version updates.

---

## 🚀 Upcoming / Backlog (Phase 2 & Beyond)
- [ ] **Milestone Sharing:** Aesthetic export images for social media when hitting milestones (e.g., 100 hours).
- [ ] **Widgets & Live Activities:** iOS/Android home screen timer widgets.
- [ ] **Cloud Sync:** Supabase/Clerk integration for multi-device sync.
- [ ] **Pro Paywall:** Premium subscription logic (RevenueCat).
