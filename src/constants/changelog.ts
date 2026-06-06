export interface ChangelogRelease {
  version: string;
  date: string;
  features: string[];
  fixes: string[];
}

export const APP_VERSION = "1.1.0";

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: "1.1.0",
    date: new Date().toISOString().split('T')[0],
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
