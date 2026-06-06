# Product Requirements Document (PRD)

**Project Name:** ANTYO Focus  
**Document Status:** Draft  
**Target Platform:** Android (Google Play Store)  
**Tech Stack:** Expo (React Native)  

---

## 1. Executive Summary
ANTYO Focus is a minimalist, local-first focus timer and time-blocking application designed to bridge the gap between planning and reality. By capturing actual focus session data and overlaying it on a traditional calendar timeline, users gain unprecedented visibility into how they actually spend their time compared to how they planned it.

## 2. Problem Statement
Current productivity tools are fragmented. Traditional calendar apps excel at planning but fail to track execution. Timer apps (like Pomodoro trackers) capture execution data but lack a chronological visual context. As a result, users suffer from a "planning fallacy," unable to visualize the discrepancy between their scheduled blocks and real-world focus time.

## 3. Product Vision & Value Proposition
**Vision:** To provide users with a transparent, unified view of their time, automatically transforming real focus sessions into a personal productivity calendar.

**Value Proposition:** Stop guessing where your time went. ANTYO Focus lets you see your plans side-by-side with your reality, enabling data-driven adjustments to your productivity habits without manual logging.

## 4. Market Strategy & Personas

### 4.1 STP (Segmentation, Targeting, Positioning)

**1. Segmentation:**
- **Demographic:** Students (13-24), Creators/Freelancers (20-35), Knowledge Workers (25-45).
- **Psychographic:** Ambitious, driven by the "10,000 Hours Rule", frustrated by procrastination, appreciates minimalist and premium design.
- **Behavioral:** Productivity tool switchers, visual learners who rely on calendars, tech-savvy.

**2. Targeting:**
- **Primary Target:** High school/university students, and independent creators aged **13-35**. These users have a high intrinsic motivation to track their "flight hours" to achieve mastery in their specific fields.

**3. Positioning:**
- **Tagline:** "A Mastery Tracking System, Not Just a Timer."
- **Differentiation:** Unlike basic Pomodoro timers or static calendars, ANTYO Focus is positioned as a **Reality Check tool**. It visually juxtaposes PLAN vs REAL chronologically on a daily timeline, giving users an immediate, data-driven reality check on their productivity without complex setups.

### 4.2 User Personas
### Primary Personas
- **The Dedicated Student / University Student:** Needs to track study hours to ensure they meet their academic goals. Often struggles with distractions.
- **The Independent Creator / Developer:** Relies on deep work blocks to make progress on projects. Needs to know exactly how much "real" work they accomplished in a day.
- **The Knowledge Worker:** Wants to optimize their work-from-home schedule by comparing planned deep work vs. actual output.

### Secondary Personas
- **Productivity Enthusiasts / Time-Blockers:** Power users seeking better visualization tools for their daily schedules.
- **ADHD-friendly Productivity Users:** Individuals who benefit from explicit, visual representations of time passing and immediate recording of accomplishments.

## 5. Scope Definition

### In-Scope for MVP (V1)
The MVP prioritizes core loop functionality: Timer → Session Record → Calendar View → Statistics.
- **Onboarding:** A brief, frictionless introduction to the "PLAN vs REAL" concept.
- **Focus Timer:** Pomodoro mode, custom duration timers, session titling, and basic start/pause/stop functionality.
- **Stopwatch Mode:** Open-ended focus tracking for untimed work sessions.
- **Dual-View Calendar:** A split layout timeline (PLAN | REAL) where scheduled events and recorded timer sessions are displayed chronologically side-by-side.
- **Basic Statistics:** Dashboards showing daily, weekly, and monthly focus tracking, focus percentages, and session counts.
- **Session Details:** The ability to review the specifics of a completed session.
- **Settings:** Basic app configuration (timer defaults, dark/light mode if applicable).

### Out of Scope (MVP Boundaries)
- **AI Features:** Smart Mode (computer vision for face detection/distraction tracking) is strictly deferred.
- **Social & Community:** No friends lists, sharing, leaderboards, or community forums.
- **Gamification:** No XP systems, achievements, or badges.
- **Cloud Sync & Backend:** App must remain entirely local-first for MVP. No complex syncing, account creation, or backend architecture.

## 6. Detailed Feature Requirements

### 6.1 Onboarding
- **Requirement:** Display 3-4 swipeable screens explaining the core value loop.
- **Requirement:** No mandatory login or account creation required to start using the app.

### 6.2 Focus Timer & Stopwatch
- **Requirement:** Allow users to define a session title before or after starting.
- **Requirement:** Provide a classic countdown mode (e.g., 25 mins) and a count-up (stopwatch) mode.
- **Requirement:** Timer state must persist or run smoothly in the background/while the screen is off.
- **Requirement:** Users can pause and resume the timer. Paused time is logged as "distracted" or "break" duration.
- **Requirement:** On stop, a `Session` object is generated and saved to local storage.

### 6.3 Calendar (PLAN vs REAL)
- **Requirement:** Display a vertical daily timeline view.
- **Requirement:** Split the screen horizontally: Left side "PLAN", Right side "REAL".
- **Requirement:** "PLAN" blocks can be manually added by the user as intended time blocks.
- **Requirement:** "REAL" blocks are automatically populated from completed `Session` objects generated by the Timer/Stopwatch.
- **Requirement:** Blocks must visually map to the correct time of day to accurately reflect when the session occurred.

### 6.4 Statistics & Insights
- **Requirement:** Display total focus time for the current day, week, and month.
- **Requirement:** Display total session counts.
- **Requirement:** Calculate and display a "Focus Percentage" (e.g., Actual Focus Time / Planned Focus Time).

### 6.5 Smart Mode (Post-MVP)
- **Requirement:** Implement a computer vision tracing system using the mobile camera or webcam.
- **Requirement:** Automatically track and count actual focus time when the user is detected in front of the camera.
- **Requirement:** Automatically count actual distracted time when the user is away or outside the camera view, and pause the focus timer.
- **Requirement:** Provide a "View" button that opens a fullscreen window showing the live camera feed with real-time detection status (Focus or Distraction).
- **Requirement:** The camera view window must include an eye-slash icon to minimize the feed and an 'X' icon to close the window.

## 7. Non-Functional Requirements
- **Performance:** App must load instantly. State read/writes must be synchronous and fast.
- **Platform:** Native Android experience optimized for the Google Play Store.
- **Offline Capability:** 100% functionality without an active internet connection.
- **Design & UI:** Must feel premium, modern, and distinct. It should prioritize clarity and focus, avoiding cluttered interfaces. 

## 8. Technical Architecture & Stack
- **Framework:** Expo (React Native)
- **Routing:** Expo Router (File-based navigation)
- **State Management:** Zustand (Lightweight global state)
- **Persistence:** react-native-mmkv (High-performance local storage)
- **Date Handling:** date-fns (Modular date utilities)
- **Styling:** React Native `StyleSheet` (Zero-dependency, simple and scalable)

## 9. Success Metrics (KPIs for MVP)
- **Retention:** Day 1 and Day 7 retention rates.
- **Core Loop Completion:** Percentage of users who complete at least one focus session and view it on the calendar.
- **Time to Value:** Time taken from app install to the first completed focus session.

## 10. Future Roadmap (Post-MVP)
- **Phase 2:** Advanced analytics (e.g., categorizing focus sessions by project/tag).
- **Phase 3:** "Smart Mode" leveraging device cameras to detect presence and automatically pause the timer when the user walks away or looks away.
- **Phase 4:** Optional cloud syncing and backup functionality.
