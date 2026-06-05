# Upcoming Ideas & Features

## Native OS Notifications (Smart Plan Reminder)
- **Concept**: A checkbox in the Plan Editor to set a reminder.
- **Trigger**: At the exact start time of the plan, a local push notification fires.
- **Action**: If the user taps the notification, the app opens directly to the Focus Timer tab and automatically starts counting down.
- **Technical Requirements**:
  - Requires installing `expo-notifications`.
  - Requires requesting notification permissions on Android/iOS.
  - Requires a global notification listener in `_layout.tsx`.
- **Reason for Postponing**: Postponed in v1.0.x MVP to keep the app size minimal, avoid permission friction, and maintain the "Avoid overengineering at all costs" philosophy (`AGENTS.md`). Replaced with a simpler in-app window popup MVP.



