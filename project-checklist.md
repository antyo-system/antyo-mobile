# ANTYO Focus - Project Checklist

## Project Documentation & Usage
This checklist tracks the progress of **ANTYO Focus**. 
- **Status Legend:**
  - ✅ **Completed:** Task is finished and verified in the app.
  - 🏗️ **In Progress:** Task is currently being developed.
  - ⏳ **Pending:** Task is scheduled for future work.
  - 📋 **Documentation:** Linked documentation for specific features.
- **Maintenance:** Update this file whenever a task is completed or when requirements shift.

## Phase 1: Environment & Core Setup (Completed ✅)
- [x] Create Expo App & TypeScript
- [x] Configure Expo Router
- [x] Install Core Dependencies & NativeWind
- [x] Setup Zustand & MMKV Local Storage

## Phase 2: Core MVP Screens (Completed ✅)
- [x] Build Focus Timer Screen (Start, Pause, Stop, Session Model)
- [x] Build Calendar Timeline (Split layout Plan vs Real)
- [x] Build Statistics Screen (Today's Focus & Session Count)

## Phase 3: Advanced Core Features
**Epic:** Fill in the missing functional gaps from the original requirements.
- [x] **Task 3.1: Stopwatch Mode**
  - **Goal:** Add an alternative mode in the Timer tab to count *up* instead of *down*.
- [x] **Task 3.2: Date Selection & Monthly Calendar**
  - **Goal:** Allow users to select different days in the Calendar tab instead of only viewing "Today".
- [x] **Task 3.3: Advanced Statistics**
  - **Goal:** Add "Weekly Focus" and "Total All-Time Focus" aggregations to the Stats screen.
- [x] **Task 3.4: Session Management**
  - **Goal:** Add UI to view a history list of sessions and delete them if necessary.
- [x] **Task 3.5: Interactive Plan Blocks (CRUD & Drag/Drop)**
  - **Goal:** Allow users to create, edit, delete, drag-and-drop to move, and edge-drag to resize planned time blocks on the calendar timeline.
- [x] **Task 3.6: Plan Recurrence Engine**
  - **Goal:** Support one-time, daily, weekly, monthly, and custom specific day recurring plans.
- [x] **Task 3.7: Monthly Calendar View**
  - **Goal:** Allow users to pick months and jump to distant dates using a full monthly calendar grid.
- [x] **Task 3.8: Dynamic Time Left Countdown**
  - **Goal:** Add a "Time Left Today" widget to Stats that calculates waking hours remaining based on custom sleep schedules.
- [x] **Task 3.9: Sleep Debt Mode**
  - **Goal:** Add a toggle during sleep hours that allows users to see exactly how much sleep debt they are accumulating in a red UI.
- [x] **Task 3.10: Edit Real Timeblocks**
  - **Goal:** Allow users to edit the task name and add notes to real tracked timeblocks, and delete them from the calendar timeline. Cannot change duration.

## Phase 4: Polish & UX
**Epic:** Elevate the app to a premium feel before release.
- [x] **Task 4.1: Empty States**
  - **Goal:** Design beautiful empty states for the Calendar and Stats when no sessions exist.
- [x] **Task 4.2: Animations & Haptics**
  - **Goal:** Add subtle micro-animations and haptic feedback when pressing Start/Stop.
- [x] **Task 4.3: Branding Assets**
  - **Goal:** Configure the custom App Icon and Splash Screen via Expo.

## Phase 5: Authentication & Cloud (Deferred to v2.0)
**Epic:** Enable multi-device syncing. (Deferred to ensure faster MVP time-to-market)
- [ ] **Task 5.1: Integrate Clerk Auth**
  - **Goal:** Set up secure user authentication using Clerk to allow users to sign in and sync their data.
- [ ] **Task 5.2: Sync Local MMKV data to a Backend (e.g., Supabase)**
  - **Goal:** Implement a synchronization layer that pushes local MMKV data to a Supabase database for multi-device access.

## Phase 6: Release
**Epic:** Ship the app to production.
- [x] **Task 6.0: Integrate PostHog for local event analytics**
  - **Goal:** Track specific usage events (e.g., Session Starts, Stopwatch Mode toggles) to gather product insights without bloating the app.
- [ ] **Task 6.1: Build Android APK / AAB**
  - **Goal:** Generate production-ready build files for the Google Play Store using EAS Build or local Gradle.
- [ ] **Task 6.2: Privacy Policy & Store Screenshots**
  - **Goal:** Prepare the necessary marketing and legal assets required for store submission.
- [ ] **Task 6.3: Internal Testing & Production Release**
  - **Goal:** Distribute the app to internal testers and then publish the final version to the store.

---

## Technical Documentation & Reference
- **[AGENTS.md](./AGENTS.md):** Coding standards, philosophy, and architectural rules.
- **[README.md](./README.md):** High-level overview, features, and setup instructions.
- **Source Code Guide:** (Planned) Detailed documentation of hooks, stores, and utils.
