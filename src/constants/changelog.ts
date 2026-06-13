export interface ChangelogRelease {
  version: string;
  date: string;
  features: string[];
  fixes: string[];
}

export const APP_VERSION = "1.11.0";

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: "1.11.0",
    date: "2026-06-13",
    features: [
      "Smart Notification Scheduling: Automatically sets native recurring calendar notifications for your repeating routines.",
      "Haptic Feedback Integration: Experience satisfying tactile feedback when starting a timer directly from a notification tap.",
      "Localized Notifications: Native push notifications are now seamlessly localized based on your app's language settings (English, Indonesian, Mandarin).",
      "Full Data Portability: The JSON Export/Backup feature now safely includes all application state, settings, and task milestones."
    ],
    fixes: []
  },
  {
    version: "1.10.0",
    date: "2026-06-12",
    features: [
      "Smart Timer Split System (Pomodoro Cycle): Automatically breaks down long calendar sessions into manageable focus and break cycles.",
      "Custom Pomodoro Target Mode: Manually configure custom cycles (e.g. 4 sessions of 25 mins) from the Timer Settings modal.",
      "Priority System: Star priority tasks to emphasize importance, visually highlighted with stars in the Timeline and Calendar.",
      "Pinch-to-Zoom: Added smooth Pinch-to-Zoom gesture on the Timeline view to expand or compress time scales dynamically."
    ],
    fixes: []
  },
  {
    version: "1.9.0",
    date: "2026-06-12",
    features: [
      "Timeline Feature Parity: Full synchronization of features between Daily Plan and Timeline modes. Added Drag-and-Drop date shifting, 'Eye' mode split-view with Real Sessions, and Mark as Done functionality for Milestones.",
      "Timeline Reminders: Set automatic push notifications on the Start Date for your Project Milestones."
    ],
    fixes: []
  },
  {
    version: "1.8.0",
    date: "2026-06-11",
    features: [
      "Project Management Hub: Integrated a new Projects section into the Mastery tab to separate infinite long-term skills from finite goal-oriented projects.",
      "On the Radar: Added a minimal, dynamic early warning system in the Calendar tab to display upcoming project milestones (within 14 days) to drive daily urgency."
    ],
    fixes: []
  },
  {
    version: "1.7.3",
    date: "2026-06-11",
    features: [
      "Smart Plan Reminders: Set start reminders on plan blocks to trigger native OS push notifications using expo-notifications.",
      "Inline Task Scheduler: Instantly create and manage tasks directly inside the calendar plan quick actions modal."
    ],
    fixes: []
  },
  {
    version: "1.7.2",
    date: "2026-06-11",
    features: [],
    fixes: [
      "Fixed Donut chart rendering artifacts (SVG path parsing issues) on Android release builds.",
      "Fixed missing translation types."
    ]
  },
  {
    version: "1.7.1",
    date: "2026-06-10",
    features: [
      "Strict Tracking UX: The REAL calendar column is now strictly read-only for manual creation, enforcing the Mastery 10,000 Hours rule philosophy.",
      "Sticky Compare Toggle: Moved the 'Eye' compare toggle from the header to the sticky bottom bar for easier access when the calendar is collapsed."
    ],
    fixes: [
      "Fixed critical calendar freeze bug where the screen could not be scrolled after dragging a time block.",
      "Fixed missing bottom Navbar on web/localhost by adjusting z-index stacking.",
      "Fixed logic where tapping the calendar in compare mode incorrectly created plan vs real sessions."
    ]
  },
  {
    version: "1.7.0",
    date: "2026-06-09",
    features: [
      "Task & To-Do List View: Added a dedicated Task feed directly inside the Calendar for better task management.",
      "Task Scheduling Modal: Added the ability to seamlessly schedule a task into a specific timeblock with one tap.",
      "Zen Mode (Curtain): Added an up-arrow toggle to hide the calendar grid and focus entirely on the day's timeline.",
      "Interactive Tutorial: Added a guided, interactive walkthrough for the Calendar screen to onboard new users."
    ],
    fixes: [
      "Fixed alignment issues in Plan Editor modal.",
      "Refined translation texts for shorter, more natural UI strings."
    ]
  },
  {
    version: "1.6.1",
    date: "2026-06-09",
    features: [],
    fixes: [
      "Fixed timer pausing when device goes to sleep. Keep-awake is now enabled on the focus screen.",
      "Fixed timer drift when the app goes to the background using exact time delta calculations.",
      "Fixed text wrapping UI issue on the Smart Routine Banner for smaller devices.",
      "Added missing translations for the Timer Settings modal."
    ]
  },
  {
    version: "1.6.0",
    date: "2026-06-09",
    features: [
      "Smart Routine Banner: Dynamic banner now smoothly bridges the gap between planned calendar schedules and real focus sessions.",
      "Dynamic Time Calculation: Automatically calculates how late you are to a scheduled session and strictly loads the exact remaining time.",
      "Soft Overlap Warning: Elegantly warns you if your manual timer duration will overlap with an upcoming scheduled plan.",
      "Mandarin (Simplified) Translation: Full language support for Mandarin."
    ],
    fixes: [
      "Fixed variable interpolation error (%%) in translation string parameters.",
      "Fixed 'Scheduled Routine Active' UI showing missing or cropped texts."
    ]
  },
  {
    version: "1.5.1",
    date: "2026-06-07",
    features: [
      "Timer Settings UI Tweaks: Bottom sheet now expands naturally without scrolling, and scales perfectly on smaller devices."
    ],
    fixes: []
  },
  {
    version: "1.5.0",
    date: "2026-06-07",
    features: [
      "Pomodoro Chaining: Seamlessly chain focus sessions with break sessions automatically using the Auto-Play feature.",
      "Redesigned Timer Settings: A new, highly-polished compact UI with a bottom-sheet modal and steppers for setting durations.",
      "Session Complete Overlay: A beautifully animated fullscreen overlay indicating when a focus or break session is completed."
    ],
    fixes: [
      "Fixed UI cropping issues on the Timer Settings page for smaller devices.",
      "Fixed 'Time Left Today' widget text overflow on smaller screens."
    ]
  },
  {
    version: "1.4.0",
    date: "2026-06-07",
    features: [
      "Quick Life Logging: 'Mark as Done' button for non-skill plans allows instant tracking without a timer.",
      "Lock Schedule Mode: A new toggle to lock calendar blocks, preventing accidental dragging.",
      "Manual Session Editor: Full ability to edit or manually log past Focus Sessions directly from the calendar."
    ],
    fixes: [
      "Fixed 'New Skill' modal input being hidden by keyboard on Android.",
      "Delete Focus Session button UI now matches the Plan editor."
    ]
  },
  {
    version: "1.3.0",
    date: "2026-06-07",
    features: [
      "Calendar Split View: Plan and Reality blocks are now cleanly separated side-by-side to avoid overlaps.",
      "Focus Mode Toggle: Added a 'Eye' toggle icon in the calendar to switch between side-by-side comparison and full-width focus mode.",
      "Streamlined UI: Removed redundant progress bars and profile info for a cleaner mastery and settings experience."
    ],
    fixes: [
      "Fixed 'Couldn't find a navigation context' fatal error when quickly changing dates in the calendar.",
      "Updated tutorial bubble text with better hints for switching between Schedule and Task views."
    ]
  },
  {
    version: "1.2.0",
    date: "2026-06-07",
    features: [
      "Interactive Multi-Step Tutorial: Brand new onboarding experience across all tabs to guide first-time users.",
      "100% Data Safety: Migrated to a custom expo-file-system storage adapter for bulletproof local persistence."
    ],
    fixes: [
      "Fixed warning 'Native module is null' caused by AsyncStorage on Expo Go.",
      "Fixed tutorial circle overlay sizing issues on smaller screens."
    ]
  },
  {
    version: "1.1.0",
    date: "2026-06-06",
    features: [
      "The Automated Routine Engine: Create recurring schedule blocks directly from the Mastery tab.",
      "Daily Target Tracking: Set and track daily minutes goal per skill.",
      "Skill-Plan Linking: Your calendar plans can now be dynamically linked to specific mastery skills.",
      "Auto-Sync Colors: Plan colors automatically sync with the assigned skill."
    ],
    fixes: [
      "Fixed issue where skillId was not properly saved to plans."
    ]
  },
  {
    version: "1.0.4",
    date: "2026-06-06",
    features: [
      "Added Google Calendar style side-by-side layout for overlapping schedule blocks.",
      "Added custom color picker for Plan and Real Session cards."
    ],
    fixes: [
      "Fixed TypeScript errors in layout calculation."
    ]
  },
  {
    version: "1.0.0",
    date: "2026-06-05",
    features: [
      "Initial Release of ANTYO Focus.",
      "Core Mastery Tracking System and 10,000 Hours rule implementation.",
      "Plan vs Real comparison features."
    ],
    fixes: []
  }
];
