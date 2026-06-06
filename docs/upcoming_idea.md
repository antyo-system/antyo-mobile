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

## AI-Driven "Coach Insights" Banner
- **Concept**: Sebuah kalimat dinamis di puncak layar *Stats* (atau layar lainnya) yang memberikan teguran halus atau pujian berdasarkan performa user hari itu.
- **Example**: "Kamu produktif hari ini, tapi banyak terdistraksi di jam 3 sore."
- **Reason for Postponing**: Nanti akan dipertimbangkan jika sudah ada integrasi AI/ML atau logic yang cukup kuat untuk membaca tren mingguan.

## Device Screen Time Integration
- **Concept**: Meminta izin akses (permission) ke data *Screen Time* atau *App Usage* perangkat (level OS) untuk membandingkan jam fokus dengan penggunaan aplikasi lain (seperti sosmed).
- **Goal**: Menampilkan data waktu distraksi yang sangat akurat dan berbasis realita di dalam *Stats*.
- **Reason for Postponing**: Masih terlalu dini untuk MVP, dan integrasi API OS native (Android UsageStats, iOS ScreenTime) sangat kompleks dan butuh custom native module di Expo. Disimpan di bank ide untuk iterasi mendatang.

