# ANTYO Focus - Design System

This document outlines the core visual identity, color palette, and UI components for **ANTYO Focus**. Following these guidelines ensures a consistent, premium, and distraction-free user experience across all screens.

## 1. Color Palette

We use a "Clean & Focused" aesthetic, relying heavily on stark white/dark backgrounds with vibrant, singular accent colors for interactivity.

### Core Backgrounds & Surfaces
- **Primary Background:** `bg-white` (Light) / `bg-gray-950` (Dark)
- **Secondary Surfaces (Cards, Modals):** `bg-white` (Light) / `bg-gray-900` (Dark)
- **Input Fields & Toggles:** `bg-gray-100` (Light) / `bg-gray-800` (Dark)

### Accent Colors
- **Primary Action (Start, Save, Focus):** Blue (`bg-blue-600`)
- **Destructive Action (Give Up, Delete):** Red (`bg-red-500` / `text-red-500`)
- **Warning/Alert:** Yellow (`bg-yellow-500` / `text-yellow-500`)
- **Calendar 'Plan' Blocks:** Gray Outline (`border-gray-300` / `border-gray-700`)
- **Calendar 'Real' Blocks:** Blue Solid (`bg-blue-100 border-blue-500`)

### Typography Colors
- **Primary Text (Headers, Timer):** Black/Very Dark Gray (`text-gray-900`) / White (`text-gray-100`)
- **Secondary Text (Subtitles, Labels):** Gray (`text-gray-500` / `text-gray-400`)

---

## 2. Typography Hierarchy

- **Massive (Timer Display):** `text-[110px] font-bold tabular-nums tracking-tighter`
- **Headers (Screen Titles):** `text-2xl font-bold`
- **Subheaders (Modal Titles):** `text-xl font-bold`
- **Button Text:** `text-lg font-bold`
- **Body Text (Inputs, Descriptions):** `text-base font-medium`
- **Small Labels (Time markers):** `text-xs font-medium text-gray-400`

---

## 3. UI Components & Shapes

We exclusively use **Pill-shaped** and heavily rounded corners to give the app a friendly, modern, and tactile feel.

### Buttons
- **Primary Buttons:** `rounded-3xl` or `rounded-full`, full-width (`w-full`), tall padding (`py-4`).
- **Interaction:** All primary buttons should scale down slightly on press (using `react-native-reanimated` springs) and provide Haptic Feedback.

### Inputs
- **Text Fields:** `rounded-full`, soft gray background (`bg-gray-100`), centered text for prominent inputs (like the Timer Focus input).

### Modals & Bottom Sheets
- **Modals:** Centered, `rounded-3xl`, soft shadows (`shadow-xl`), dark semi-transparent overlay (`bg-black/30`).

---

## 4. Haptics Guidelines

Tactile feedback is critical for a premium mobile experience.
- **Starting an action (Start Timer):** `Medium` Impact.
- **Stopping/Pausing an action:** `Rigid` Impact.
- **Successful completion (Saving a session):** `Success` Notification.
- **Destructive/Warning (Abandoning):** `Error` Notification.
