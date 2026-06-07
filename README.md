# ANTYO Focus `v1.5.1`

ANTYO Focus is a focus timer and time-blocking app that automatically transforms real focus sessions into a personal productivity calendar. It bridges the gap between what you planned to do and what actually happened.

## Project Overview
Most productivity apps only know what users planned to do. Pomodoro apps know timer data. Calendar apps know scheduled plans. Neither knows what actually happened. ANTYO Focus solves this by recording focus/distracted durations and visualizing them on a calendar alongside your planned blocks.

## Features
- **Focus Timer:** Pomodoro mode, custom timer, session title, start/pause/stop.
- **Pomodoro Chaining (Auto-Play):** Automatically transition between focus and break sessions.
- **Stopwatch:** Open-ended focus tracking.
- **Calendar (PLAN vs REAL):** Split layout showing user-scheduled blocks alongside actual sessions generated from timer data.
- **Statistics:** Daily, weekly, monthly focus tracking, heatmaps, and session counts.
- **Session Detail:** Deep dive into specific focus blocks.

## Screens
1. Onboarding
2. Focus Timer
3. Stopwatch
4. Calendar
5. Statistics
6. Session Detail
7. Settings
8. Profile (optional)

## Tech Stack
- **Framework:** Expo (React Native) v56
- **Routing:** Expo Router
- **State Management:** Zustand
- **Storage:** `expo-file-system` (Custom adapter for 100% data safety)
- **Styling:** NativeWind (Tailwind CSS)
- **Dates/Time:** date-fns

## Installation & Development Setup
*Checklist for setup will be updated as the project initializes.*

1. Clone the repository.
2. Install dependencies: `npm install` (or `bun install` / `yarn install`).
3. Start the Expo development server: `npx expo start`.
4. Run on an Android emulator or physical device using the Expo Go app or a development build.

## Folder Structure
```text
/app             # Expo Router screens (file-based routing)
/src
  /components    # Reusable UI components
  /store         # Zustand state stores
  /utils         # Helper functions
  /theme         # Colors, typography, spacing constants
  /assets        # Images, fonts, icons
```

## Roadmap & Monetization Strategy
To see our detailed path from MVP to 100M downloads, including our B2C Freemium model and Go-To-Market strategy, please read:
👉 **[ROADMAP_100M.md](./docs/ROADMAP_100M.md)**