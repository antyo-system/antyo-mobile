# ANTYO Focus - Project Checklist

## Project Documentation & Usage
This checklist tracks the progress of **ANTYO Focus** from its MVP state all the way to the 100M downloads vision outlined in `ROADMAP_100M.md`.
- **Status Legend:**
  - ✅ **Completed:** Task is finished and verified in the app.
  - 🏗️ **In Progress:** Task is currently being developed.
  - ⏳ **Pending:** Task is scheduled for future work.
- **Maintenance:** Update this file whenever a task is completed or when requirements shift.

---

## Phase 1: The Bulletproof Foundation (MVP & V1 Release)
**Status: 🏗️ In Progress (Near Completion)**
*Fokus: Retensi D-1 & D-7. Pengguna harus jatuh cinta pada pandangan pertama.*

**Core Setup & Architecture**
- [x] Create Expo App, TypeScript, & Router
- [x] Install NativeWind, Zustand & MMKV Local Storage

**Core Features (Completed)**
- [x] Focus Timer Screen (Start, Pause, Stop, Session Model)
- [x] Stopwatch Mode
- [x] Calendar Timeline (Split layout Plan vs Real)
- [x] Interactive Plan Blocks (CRUD, Drag/Drop, Resize)
- [x] Plan Recurrence Engine (Daily, Weekly, Monthly)
- [x] Edit Real Timeblocks (Add notes, rename)
- [x] Mastery System MVP (Skills, Pillars, Inline CRUD in Focus Tab)

**Statistics & Insights (Completed)**
- [x] Daily & Weekly Focus Statistics
- [x] Dynamic Time Left Countdown (Waking hours remaining)
- [x] Sleep Debt Mode (Red UI for tracked sleep debt)

**Polish & UX (Completed)**
- [x] Beautiful Empty States for Calendar & Stats
- [x] Animations & Haptics (Start/Stop interactions)
- [x] Custom App Icon & Splash Screen

**V1 Release Preparation (In Progress)**
- [x] Native OS Notifications (Smart Plan Reminders using `expo-notifications`)
- [x] Integrate PostHog for event analytics (Zustand event triggers pending)
- [x] Build Android APK / AAB (ProGuard configurations set)
- [x] Privacy Policy & Play Store Screenshots
- [x] Internal Testing & Production Release (V1.0)

### 🔍 MVP-to-Live Production Audit Tasks
- **🔴 Critical (Ship-blockers)**
  - [x] Implement Local Data Import/Restore in profile
  - [x] Add Zustand Store Versioning & Migration logic for all 6 persisted stores
  - [x] Add native `ErrorBoundary` fallback UI to layout root
  - [x] Migrate UUID package or utility to replace `Date.now()` IDs (14 files)
  - [x] Fix Delete All Data to reset all stores (Plans, Tasks, Mastery, App, Settings, Sessions)
- **🟠 High (Launch Essentials)**
  - [x] Add Crash Reporting (Sentry integration)
  - [x] Integrate real PostHog event tracking (Timer, Calendar, Milestones)
  - [x] Implement native "Rate This App" trigger (`expo-store-review`)
  - [x] Add basic accessibility labels/roles to interactive elements
  - [x] Configure Play Store Deep Link scheme & store URL constant
  - [x] Hydration check & splash screen loading guard in `_layout.tsx`
  - [x] Rebuild via EAS for production APK/AAB containing `expo-notifications`
- **🟡 Medium (Quality Bar)**
  - [x] Remove hardcoded default skill data ("Coding") from Mastery store initial state
  - [x] Write critical unit tests for `/src/utils` (`streak.ts`, `mastery.ts`, `calendar.ts`, `insights.ts`)
  - [x] Hardcode dynamic changelog dates in `changelog.ts`
  - [x] Include all stores (Skills, Tasks, App Settings) in profile Export/Backup JSON
- **🟢 Nice-to-have (Post-launch)**
  - [x] Smart Notification Scheduling for recurring plans
  - [x] Haptic Feedback on Notification Tap timer start
  - [x] Onboarding skip button
  - [x] Localized Notification text logic


---

## Phase 2: The Hook & Gamification
**Status: ⏳ Pending**
*Fokus: Psikologi Habit 10.000 Jam & Viralitas Organik.*

- [ ] **Task 2.1: Widgets & Live Activities**
  - **Goal:** Support iOS Live Activities & Android Widgets so the timer is always visible on the lock/home screen.
- [ ] **Task 2.2: Milestone Sharing (Viral Loop)**
  - **Goal:** Build an aesthetic "Share to IG Story / TikTok" image generator when users hit milestones (e.g., "100 Hours of Coding").
- [ ] **Task 2.3: Streaks & Heatmap**
  - **Goal:** Add a GitHub-style contribution graph to trigger FOMO and maintain daily streaks.
- [ ] **Task 2.4: Pillars Visual Expansion**
  - **Goal:** Upgrade the Pillars UI into a visual "Skill Tree" resembling RPG games for stronger gamification.

---

## Phase 3: Cloud, Sync & Premium (Monetization)
**Status: ⏳ Pending**
*Fokus: Infrastruktur Skala Besar & Monetisasi Awal (Freemium).*

- [ ] **Task 3.1: Backend Integration (Clerk + Supabase)**
  - **Goal:** Seamlessly sync local MMKV data to the cloud for multi-device access without losing local-first speed.
- [ ] **Task 3.2: Paywall Integration (ANTYO Pro)**
  - **Goal:** Integrate RevenueCat for subscription management.
- [ ] **Task 3.3: Advanced Analytics (Pro)**
  - **Goal:** Data export (CSV), predictive charts, and correlation analysis (e.g., Sleep vs Focus).
- [ ] **Task 3.4: Aesthetic Customization (Pro)**
  - **Goal:** Unlock OLED Dark Mode, Neon themes, custom app icons, and premium White Noise sounds.

---

## Phase 4: Social Proof & B2B
**Status: ⏳ Pending**
*Fokus: Efek Jaringan & Pertumbuhan Eksponensial (10M+)*

- [ ] **Task 4.1: Leaderboards & Squads**
  - **Goal:** Allow users to create private groups to see who has the most deep work hours this week.
- [ ] **Task 4.2: B2B / Team Dashboard**
  - **Goal:** Enterprise portal for agencies/startups to track team productivity and integrate with Slack/Discord.
- [ ] **Task 4.3: AI Coaching (Pro)**
  - **Goal:** On-device AI to analyze work patterns and suggest optimal break times and focus schedules.

---

## Technical Documentation & Reference
- **[AGENTS.md](../AGENTS.md):** Coding standards, philosophy, and architectural rules.
- **[ROADMAP_100M.md](./ROADMAP_100M.md):** High-level strategic vision and monetization.
- **[README.md](../README.md):** High-level overview, features, and setup instructions.
