# ANTYO Focus - Design System & Brand Guidelines

Dokumen ini adalah panduan resmi untuk segala hal yang berkaitan dengan *User Interface* (UI) dan *User Experience* (UX) ANTYO Focus. Gunakan dokumen ini sebagai referensi utama saat Anda membuat materi pemasaran (seperti *Feature Graphic*, *Screenshot Play Store*, atau postingan media sosial) agar merek (*brand*) ANTYO Focus tetap konsisten.

---

## 1. Filosofi Desain (Design Philosophy)
ANTYO Focus mengusung tema **"Premium, Brutally Honest, and Distraction-Free"**.
- **Minimalist:** Tidak ada elemen dekoratif yang tidak berguna. Setiap *pixel* memiliki fungsi.
- **High Contrast:** Mengandalkan kontras tipografi (huruf besar vs huruf tebal) untuk mengatur hierarki informasi.
- **Glassmorphism & Soft Shadows:** Menggunakan bayangan lembut (*shadow-sm*, *shadow-lg*) untuk memisahkan elemen dari *background*.

---

## 2. Tipografi (Font Family)

Aplikasi ANTYO Focus secara *native* (bawaan) menggunakan **System Font** dari masing-masing perangkat pengguna (San Francisco di iPhone, dan Roboto di Android).

Namun, **UNTUK KEPERLUAN DESAIN GAMBAR PROMOSI / CANVA / FIGMA**, sangat diwajibkan menggunakan salah satu dari dua font berikut agar terlihat senada dengan aplikasi:

### 🌟 Primary Font: **Inter** (Sangat Disarankan)
Inter adalah *font* standar industri *tech startup* modern. Bentuknya bersih dan sangat mudah dibaca.
- **Headings / Angka Timer:** Gunakan **Inter Black (900)** atau **Inter Bold (700)** dengan *tracking* (jarak huruf) yang dirapatkan sedikit (*tight*).
- **Body / Paragraf:** Gunakan **Inter Medium (500)**.
- **Labels (Kecil):** Gunakan **Inter Bold** dengan format huruf kapital semua (UPPERCASE) dan *tracking* dilebarkan (*widest*). Contoh: `SCHEDULED ROUTINE ACTIVE`.

*(Alternatif Font jika Inter tidak ada: SF Pro Display atau Roboto).*

---

## 3. Ikonografi (Icon System)

### Jenis Ikon Utama: **Feather Icons**
Seluruh aplikasi ANTYO Focus menggunakan pustaka **Feather Icons** (dari `@expo/vector-icons`).
- **Gaya Visual:** Garis luar (*outline*), bersih, ujung melingkar (*rounded*), dan tidak diisi warna (*unfilled*).
- **Ketebalan (Stroke):** Standard (2px).
- **Di mana mencari file/referensi ikon ini?** 
  Anda bisa melihat semua koleksi ikonnya di website resmi: [feathericons.com](https://feathericons.com/). Anda bisa men-*download* ikon berformat `.svg` langsung dari website tersebut untuk dimasukkan ke Canva/Figma Anda.

### Emoji (Sebagai Pendukung)
Untuk sentuhan *gamification* yang ramah (seperti ikon "🔥" untuk *Streak* atau "💡" untuk Tip), kita menggunakan Emoji standar dari sistem OS.

---

## 4. Palet Warna (Color Palette)

ANTYO Focus dirancang penuh mendukung mode **Light** dan **Dark Mode** secara dinamis (menggunakan Tailwind CSS / NativeWind). 

Berikut adalah kode warna heksadesimal (HEX) untuk materi desain Anda:

### 🔵 Primary Brand (Aksi Utama & Fokus)
- **Blue 600** (`#2563EB`): Digunakan untuk Tombol "Start", "Save", dan aksi utama.
- **Blue 50** (`#EFF6FF`): Digunakan untuk latar belakang *bubble* informasi di Light Mode.

### ⚫ Background & Surface (Latar Belakang)
- **Gray 50** (`#F9FAFB`): Latar belakang utama aplikasi di Light Mode (Bukan putih murni, agar mata tidak sakit).
- **Gray 950** (`#030712`): Latar belakang utama aplikasi di Dark Mode (Bukan hitam murni, tapi kebiru-biruan sangat gelap agar terasa premium).
- **White** (`#FFFFFF`): Warna kotak (*card*) di Light Mode.
- **Gray 900** (`#111827`): Warna kotak (*card*) di Dark Mode.

### 🔴 Semantic Colors (Status)
- **Orange 500** (`#F97316`): Warna untuk *Streak* 🔥 dan *Time Left / Active Plan*.
- **Green 500** (`#22C55E`): Warna untuk sesi "Focused" (Tuntas tanpa distraksi).
- **Red 500** (`#EF4444`): Warna untuk sesi "Distracted" atau utang jam tidur (*Sleep Debt*).
- **Yellow 500** (`#EAB308`): Warna untuk label "Plan" atau jadwal rencana.

---

## 5. Komponen Kunci (UI Patterns)

Jika Anda menggambar ulang UI untuk di-*mockup*, perhatikan aturan *styling* ini:
1. **Border Radius (Kelengkungan):** 
   - Tombol utama dan kotak (Card) berukuran besar menggunakan sudut yang sangat melengkung (`rounded-2xl` atau `rounded-3xl` / radius ~16px hingga 24px).
2. **Shadows (Bayangan):** 
   - Kotak (Card) selalu memiliki garis batas super tipis (`border-gray-100` di Light Mode, `border-gray-800` di Dark Mode) yang dipadukan dengan bayangan (*shadow*) yang sangat transparan dan lembut. Jangan gunakan bayangan hitam pekat!
3. **Pemisahan (Divider):** 
   - Gunakan garis abu-abu samar (`bg-gray-100`) untuk memisahkan antar bagian, bukan kotak tebal.

---

> [!TIP]
> **Aturan Praktis untuk Mendesain Gambar Promosi:**
> 1. Gunakan warna **Gray 950** (`#030712`) sebagai *background* *banner* jika Anda ingin kesan elegan, ambisius, dan premium (tema *Mastery*).
> 2. Tempelkan ikon-ikon SVG dari **Feather Icons**.
> 3. Tulis *headline* *banner* Anda menggunakan font **Inter Black**.
> 4. Jika butuh warna aksen menyala (*glowing*), gunakan warna kebesaran kita: **Blue 600** (`#2563EB`).


