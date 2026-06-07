# ANTYO Focus `v1.5.1`

ANTYO Focus is a highly opinionated focus timer and time-blocking application built around the **10,000 Hours to Mastery** philosophy. It bridges the gap between what you planned to do and what actually happened by tracking real-world focus sessions and mapping them against your scheduled calendar.

---

## 🎯 1. Core Mastery Engine (10,000 Hours)
- **Skill & Pillar Creation:** Create custom skills (e.g., Coding) and sub-categories/pillars (e.g., React Native).
- **Mastery Progress Tracking:** Automatically calculates total hours accumulated across all sessions towards the ultimate 10,000 hours goal.
- **Daily Targets:** Set daily targets per skill. The UI gamifies completion with animated flames and satisfying haptics.

## ⏱️ 2. The Focus Engine
- **Smart Timer Mode:** A robust classic countdown timer with Focus and Break tracking.
- **Pomodoro Chaining (Auto-Play):** Seamlessly auto-play breaks after focus sessions (and vice versa) for uninterrupted flow states.
- **Stopwatch Mode:** Open-ended count-up timer for unconstrained deep work.
- **Completion Gamification:** Highly satisfying animated full-screen overlays (spring bounce + haptic feedback) when a session finishes.

## 🗓️ 3. Calendar & Time-Blocking (Plan vs Real)
- **Split View Layout:** Left side (Yellow) for the **Planned Schedule**, Right side (Blue) for **Real Executed Sessions**.
- **Drag & Drop Planning:** Intuitive gesture-based creation and resizing of time blocks.
- **Automated Routine Engine:** Create recurring schedules (Daily, Weekdays, Specific Days) that auto-populate.
- **Life Logging & Manual Edits:** One-click 'Mark as Done' for non-skill plans, plus full retroactive manual session editing directly on the calendar.
- **Lock Mode:** A padlock toggle to freeze the calendar to prevent accidental dragging/editing.

## 📊 4. Gamification & Statistics
- **Global Streaks (🔥):** Calculates consecutive days where the global focus target is met.
- **Contribution Heatmap:** A GitHub-style daily activity grid to visualize consistency over the year.
- **Weekly Bar Chart & Analytics:** Compares week-by-week focus hours and provides breakdowns of pure "Focus" vs "Distracted" time.
- **Discipline Score:** A percentage score comparing "Planned vs Executed" hours, coupled with dynamic AI-like coaching feedback.
- **Time Widgets:** Calculates 'Time Left Today' based on your configured sleep schedule and a 'Lifetime Countdown'.

## 🛠️ 5. Infrastructure & Settings
- **100% Local-First Storage:** Custom `expo-file-system` adapter ensuring Zustand state is ultra-fast and never lost across environments.
- **Data Portability:** Export full raw data as Backup (TXT) or Sessions to Excel (CSV).
- **Onboarding Flow:** Interactive multi-step tutorial bubbles (`SpotlightOverlay`) across all major tabs.
- **Theme Customization:** Full support for System, Light, and Dark Mode, paired with NativeWind.
- **In-App Changelog System:** Read about the latest features and bug fixes directly in the app.

---

## Tech Stack
- **Framework:** Expo (React Native) v56
- **Routing:** Expo Router (File-based navigation)
- **Language:** TypeScript (Strict Mode)
- **State Management:** Zustand (with custom file-system persistence)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Dates/Time:** date-fns

## Roadmap & Monetization Strategy
ANTYO Focus is currently in **Phase 1 (The Local-First Core)**.
To see our detailed path to 100M+ downloads, including our B2C Freemium model, Cloud Sync, Gamification progression, and Go-To-Market strategy, please read the overarching product strategy document:
👉 **[ROADMAP_100M.md](./docs/ROADMAP_100M.md)**

## Installation & Development Setup
1. Clone the repository.
2. Install dependencies: `npm install`
3. Start the Expo development server: `npx expo start`
4. Run on an Android emulator or physical device using the Expo Go app or a development build.

*Note: Strict adherence to the `AGENTS.md` and 5-Step Deletion Algorithm is mandatory when contributing to this codebase.*