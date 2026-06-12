# Upcoming Ideas & Features

## Implemented / Completed Ideas

### Native OS Notifications (Smart Plan Reminder) (Implemented in v1.7.2/v1.7.3)
- **Concept**: A checkbox in the Plan Editor to set a reminder.
- **Trigger**: At the exact start time of the plan, a local push notification fires.
- **Action**: If the user taps the notification, the app opens directly to the Focus Timer tab and automatically starts counting down.
- **Implementation**: Completed using `expo-notifications`, custom permission request dialog, background listener, and routing logic integrated into the layout.



## AI-Driven "Coach Insights" Banner
- **Concept**: Sebuah kalimat dinamis di puncak layar *Stats* (atau layar lainnya) yang memberikan teguran halus atau pujian berdasarkan performa user hari itu.
- **Example**: "Kamu produktif hari ini, tapi banyak terdistraksi di jam 3 sore."
- **Reason for Postponing**: Nanti akan dipertimbangkan jika sudah ada integrasi AI/ML atau logic yang cukup kuat untuk membaca tren mingguan.

## Device Screen Time Integration
- **Concept**: Meminta izin akses (permission) ke data *Screen Time* atau *App Usage* perangkat (level OS) untuk membandingkan jam fokus dengan penggunaan aplikasi lain (seperti sosmed).
- **Goal**: Menampilkan data waktu distraksi yang sangat akurat dan berbasis realita di dalam *Stats*.
- **Reason for Postponing**: Masih terlalu dini untuk MVP, dan integrasi API OS native (Android UsageStats, iOS ScreenTime) sangat kompleks dan butuh custom native module di Expo. Disimpan di bank ide untuk iterasi mendatang.

## Comprehensive Review & Social Share System
- **Concept**: Fitur untuk merangkum progress "Plan vs Reality" user dalam rentang waktu tertentu (Daily, Weekly, Monthly, Quarterly, Annually) dan menyediakannya dalam format visual yang estetik untuk dibagikan (share) ke media sosial (seperti Instagram Stories, Twitter, dsb).
- **Goal**: Membangun *growth loop* secara organik (sesuai *Roadmap 100M*). Saat user membagikan rutinitas disiplin mereka, ini mengundang rasa penasaran orang lain. Membantu user merefleksikan pencapaian mereka dari skala mikro (harian) hingga makro (tahunan).
- **Reason for Postponing**: Saat ini aplikasi masih fokus menstabilkan *core loop* (Timer & Calendar). Kalkulasi agregat jangka panjang dan pembuatan aset gambar/grafis untuk *social sharing* akan diimplementasikan setelah pondasi MVP benar-benar kokoh dan *user retention* stabil.

## Computer Vision Real Focus Tracking
- **Concept**: Menggunakan AI dan Computer Vision melalui kamera depan (front camera) perangkat untuk secara pasif memantau apakah pengguna benar-benar sedang fokus (berada di depan layar/buku) atau sedang terdistraksi (absen dari depan kamera atau menggunakan HP).
- **Goal**: Memberikan metrik *Real Focus* dan *Actual Distraction Time* yang objektif tanpa campur tangan manual pengguna, menjadikan aplikasi ini "pelacak kebenaran produktivitas" yang absolut ("*Neither knows what actually happened. ANTYO Focus solves this*").
- **Target Phase**: Phase 3 (Skala Besar & Premium).
- **Reason for Postponing**: Membutuhkan model AI pada perangkat (on-device ML model) yang ringan untuk mendeteksi wajah tanpa menguras baterai, serta persiapan privasi tingkat tinggi. Terlalu rumit untuk MVP.
