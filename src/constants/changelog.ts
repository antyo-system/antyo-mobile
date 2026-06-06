export interface ChangelogRelease {
  version: string;
  date: string;
  features: string[];
  fixes: string[];
}

export const APP_VERSION = "1.0.4";

export const CHANGELOG: ChangelogRelease[] = [
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
