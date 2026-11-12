# CatatPintar — Katalog Fitur & Gambaran Besar

Dokumen perencanaan untuk Proposal Skripsi — Rizky, Teknik Informatika UNIKOM.
Disusun 9 November 2026, berdasarkan pembacaan kode `CatatPintar` yang ada + hasil pencarian literatur
(lihat `Documents/pencarian-literatur-skripsi/bukti-pencarian-literatur-kuis-celah-catatan.md`).

Stack saat ini: Next.js 14 (App Router, JS) · Prisma + MySQL · NextAuth · Gemini (`@google/generative-ai`) · Tailwind 4.

---

## A. Peta kondisi sekarang

### A.1 Yang SUDAH ada dan jalan

| Area | Fitur | Berkas utama |
|---|---|---|
| Autentikasi | Register, login, sesi, profil | `api/register`, `api/auth/[...nextauth]`, `api/user/profile` |
| Organisasi | Folder CRUD, Catatan CRUD | `api/folders`, `api/notes` |
| Editor | Rich text + stabilo 4 warna, sanitasi HTML, ekspor PDF | `components/editor/*`, `lib/exportNotePdf.js` |
| Materi | Unggah PDF/PPTX → **AI membuatkan catatan** | `api/materials/route.js` |
| Kuis | Generate dari `note` atau `topic`, N soal, tingkat kesulitan | `api/generate/quiz` |
| Kuis | Kerjakan, submit, skor, simpan hasil | `api/quizzes/[quizId]/submit` |
| Kuis | Analisis AI atas jawaban yang salah (naratif) | `api/quizzes/[quizId]/analyze` |
| Flashcard | Generate dari catatan, mode belajar | `api/generate/flashcards`, `components/flashcards/StudyDeck.jsx` |
| Lain | AI Chat, dwibahasa ID/EN, tema terang/gelap, landing page | `api/generate/ai-chat`, `lib/contexts/LanguageContext.jsx`, `locales/*` |

### A.2 Yang BELUM ada — dan ini persis yang jadi kebaruan skripsi

1. **Tidak ada model "poin slide".** PDF dikirim utuh ke Gemini; PPTX dipecah per slide (`--- Slide N ---`) lalu penanda itu **dibuang** setelah catatan jadi. Tidak ada satu pun nomor halaman yang tersimpan di database.
2. **Tidak ada perbandingan catatan ↔ slide.** Tidak ada tabel, tidak ada endpoint, tidak ada konsep "celah".
3. **Sumber kuis hanya `topic` atau `note`** (`enum SourceType`). Belum ada sumber `gap`.
4. **Tidak ada lingkar perbaikan.** `analyze` hanya mengembalikan teks naratif; tidak ada rujukan ke halaman slide dan tidak ada verifikasi perbaikan catatan.
5. **Tidak ada skor kelengkapan catatan.**

### A.3 ⚠️ Konflik arsitektur yang harus diputuskan lebih dulu

`api/materials/route.js` saat ini menjalankan alur: **unggah slide → Gemini menulis catatan lengkap → simpan sebagai Note milik mahasiswa.**

Kalau alur ini dibiarkan sebagai jalur utama, **fitur kebaruan Anda mustahil jalan** — catatan dibuat dari slide, jadi menurut definisi tidak akan pernah ada celah antara keduanya. Sistem hanya akan menguji dirinya sendiri.

Ini juga bertabrakan dengan temuan Chen dkk. (2025, *PACM HCI*): makin besar porsi kerja yang diambil alih AI dalam mencatat, makin turun keterlibatan kognitif mahasiswa.

**Keputusan yang disarankan:** pertahankan fitur ini, tapi **turunkan statusnya** — lihat F0 di bawah.

---

## B. Fitur inti kebaruan — "Kuis Celah Catatan"

Ini yang diklaim sebagai kontribusi. Delapan fitur, berurutan sebagai satu pipeline.

### F0 — Pemisahan peran dokumen: Materi vs Catatan ⭐ prasyarat

Slide dosen dan catatan mahasiswa harus jadi **dua entitas berbeda**, bukan dua-duanya `Note`.

- `Material` = slide dosen (sumber kebenaran / *ground truth*).
- `Note` = tulisan mahasiswa (objek yang dinilai), punya relasi `materialId`.
- Fitur "AI buatkan catatan" yang sekarang **dipindah** jadi mode terpisah bernama misalnya *"Ringkasan Dosen"* — ditandai jelas sebagai bukan-catatan-sendiri dan **dikecualikan dari analisis celah**.
- Di layar unggah, jalur utama berubah jadi: *unggah slide → buka editor kosong di samping slide → mahasiswa mencatat sendiri.*

**Kenapa penting:** tanpa F0, tidak ada satu pun fitur di bawah yang punya arti.

### F1 — Ekstraksi poin slide (*slide point extraction*)

Memecah materi jadi unit sekecil satu klaim, bukan per halaman.

- PDF: ekstrak teks **per halaman** + nomor halaman (butuh pustaka baru, mis. `pdfjs-dist` atau `unpdf`; `@google/generative-ai` saat ini menelan PDF utuh tanpa menyimpan struktur).
- PPTX: sudah setengah jalan — `parsePptxText()` sudah memisahkan per slide, tinggal **jangan dibuang** nomornya.
- Gemini memecah tiap halaman jadi 3–10 poin: `{ teks_poin, tipe, halaman, kutipan_asli }`.
- Tipe poin: `definisi` · `rumus` · `proses/langkah` · `contoh` · `klasifikasi` · `syarat/batasan`.
- Disimpan ke tabel `SlidePoint`.

### F2 — Pemetaan catatan ↔ poin slide (*gap detection*) ⭐ jantung skripsi

Untuk tiap `SlidePoint`, tentukan statusnya terhadap catatan mahasiswa.

| Status | Arti | Jadi soal? |
|---|---|---|
| `covered` | tercatat, isinya sepadan | tidak |
| `partial` | ada, tapi kehilangan bagian penting (syarat, angka, batasan) | ya |
| `incorrect` | ada, tapi bertentangan dengan slide | ya (prioritas tertinggi) |
| `missing` | tidak ada jejaknya | ya |
| `dismissed` | mahasiswa menyatakan catatannya sudah benar | tidak |

Pendekatan dua tahap (hemat token & lebih akurat):
1. **Penyaringan**: cocokkan tiap poin dengan potongan catatan yang paling mirip (kata kunci / embedding).
2. **Penilaian**: hanya kandidat yang lolos dikirim ke Gemini untuk diberi label + `confidence` + `evidence` (kutipan dari catatan dan dari slide).

Disimpan ke tabel `NoteGap`.

### F3 — Kuis Celah Catatan ⭐ klaim kebaruan utama

- Tambah `SourceType.gap` pada enum Prisma.
- Soal **hanya** dibangkitkan dari `NoteGap` berstatus `missing` / `partial` / `incorrect`.
- Urutan prioritas: `incorrect` → `partial` → `missing`.
- Tiap `QuizQuestion` menyimpan `slidePointId` dan `slidePage` — inilah yang membuat F5 jadi gratis.
- Pengecoh (distractor) diambil dari **poin slide lain yang berdekatan**, bukan dikarang bebas — lebih sulit, lebih bermakna, dan bisa dibenarkan secara metodologis.

### F4 — Bukti & kendali mahasiswa (*evidence panel*) ⭐ wajib untuk kepercayaan

Sistem **tidak memvonis sendirian**. Untuk tiap celah, tampilkan berdampingan:
kutipan slide · kutipan catatan mahasiswa (kalau ada) · alasan singkat AI · tingkat keyakinan.

Plus tombol **"Catatan saya sudah benar"** → status jadi `dismissed`.

**Nilai akademiknya:** setiap klik tombol itu adalah **label koreksi manusia**. Kumpulan label ini jadi data untuk menghitung presisi/recall deteksi celah di Bab Hasil — tanpa perlu anotator eksternal.

### F5 — Lompat ke halaman slide (*slide jump*)

Jawaban salah → tampilkan halaman slide sumber soal, dengan poin yang relevan disorot.
Butuh penampil PDF/slide di klien (`pdfjs-dist` + kanvas, atau gambar hasil render per halaman saat F1).

### F6 — Lingkar perbaikan catatan (*remediation loop*) ⭐ penutup kebaruan

Setelah F5: kotak isian *"Tulis tambahan catatanmu untuk poin ini"* →
teks tambahan ditempelkan ke catatan →
**sistem menjalankan ulang F2 khusus poin itu** →
kalau sekarang `covered`, status celah jadi *tertutup* dan diberi penanda waktu.

Inilah yang membedakan aplikasi Anda dari "kasih tahu jawaban yang benar". Dan karena ada penanda waktu, hasilnya terukur.

### F7 — Skor Kelengkapan Catatan (*note coverage score*)

`(jumlah covered + dismissed) / total poin slide` per materi.

Tampilan: cincin persentase + rincian per status. Disimpan historis supaya bisa dibuat grafik "sebelum vs sesudah kuis" — **ini angka utama di Bab Hasil skripsi Anda.**

### F8 — Peta celah (*gap map*)

Visual per halaman slide: halaman mana yang catatannya paling bolong.
Bentuk sederhana: deretan kotak per halaman, diwarnai berdasarkan rasio celah. Diklik → langsung ke F5.

---

## C. Fitur pendukung (perlu ada supaya B jalan mulus)

| ID | Fitur | Catatan |
|---|---|---|
| S1 | Editor berdampingan slide ⟷ catatan | Satu layar: slide di kiri, editor di kanan. Mendorong mencatat sendiri. |
| S2 | Penampil PDF/PPTX di klien | Prasyarat F5 & F8. PPTX perlu dirender jadi gambar saat unggah. |
| S3 | OCR untuk slide hasil pindai | Slide berbentuk gambar akan menghasilkan 0 poin. Gemini Vision bisa menanganinya — tapi perlu deteksi "teks terlalu sedikit" lebih dulu. |
| S4 | Antrean pemrosesan + status | F1+F2 bisa makan puluhan detik. Jangan ditahan di satu request HTTP; pakai status `pending/processing/done/failed` + polling. Pola `statusStep` di `materials/page.jsx` sudah bisa dipakai ulang. |
| S5 | Pemotongan materi (*chunking*) + batas token | Slide 80 halaman akan melebihi batas. Perlu pemrosesan bertahap per halaman. |
| S6 | Penyimpanan berkas yang benar | Sekarang file ditulis ke `public/uploads/` → **ikut terekspos publik dan hilang saat deploy serverless**. Pindahkan ke luar `public/` + rute unduh terproteksi, atau pakai object storage. |
| S7 | Riwayat & versi catatan | Supaya bisa menunjukkan catatan sebelum vs sesudah perbaikan — bukti kuat di sidang. |
| S8 | Cache hasil ekstraksi | Satu materi diekstrak sekali, dipakai berkali-kali. Hemat kuota Gemini. |
| S9 | Penanganan gagal AI | `extractJson()` sekarang melempar error kalau Gemini tidak membungkus dengan ```json. Perlu fallback + percobaan ulang. |
| S10 | Dwibahasa untuk konten AI | UI sudah dwibahasa. Soal & umpan balik harus ikut `language`, dan **poin slide disimpan dalam bahasa aslinya**. |

---

## D. Fitur yang sudah ada tapi perlu disesuaikan

| ID | Fitur sekarang | Penyesuaian |
|---|---|---|
| D1 | `api/materials` membuat catatan dari slide | Jadikan mode opsional "Ringkasan Dosen"; kecualikan dari analisis celah (lihat F0). |
| D2 | `enum SourceType { topic, note }` | Tambah `gap`. |
| D3 | `QuizQuestion` tanpa asal-usul | Tambah `slidePointId`, `slidePage`, `gapId`. |
| D4 | `QuizResult` `@@unique([userId, quizId])` | **Masalah nyata:** satu kuis hanya bisa punya satu hasil, jadi percobaan ulang menimpa yang lama. Untuk skripsi Anda butuh riwayat percobaan → buang unique, atau tambah `attemptNumber`. |
| D5 | `analyze` menghasilkan teks naratif | Ubah jadi terstruktur per soal + tautan ke poin slide, supaya menyambung ke F5/F6. |
| D6 | `optionC`/`optionD` nullable | Untuk pilihan ganda 4 opsi sebaiknya wajib, atau simpan opsi sebagai JSON agar jumlahnya fleksibel. |
| D7 | Flashcard dari catatan | Bisa diperkaya: **flashcard khusus dari celah**. Murah, karena infrastrukturnya sudah ada. |
| D8 | AI Chat bebas | Batasi konteksnya ke materi + catatan yang sedang dibuka, supaya tidak jadi jalan pintas menjawab kuis. |

---

## E. Fitur opsional (kalau waktu masih ada)

| ID | Fitur | Nilai |
|---|---|---|
| E1 | Pengulangan berjarak (*spaced repetition*) untuk celah yang berulang | Sedang — mudah dituduh "sudah umum" |
| E2 | Ekspor laporan celah ke PDF | Tinggi untuk demo sidang, murah (`exportNotePdf.js` sudah ada) |
| E3 | Lencana/target kelengkapan mingguan | Rendah secara ilmiah, bagus untuk motivasi |
| E4 | Tempel beberapa materi jadi satu mata kuliah | Sedang |
| E5 | Soal isian singkat (bukan hanya pilihan ganda) | Sedang — lebih peka mengukur pemahaman |
| E6 | Mode "catat sambil dengar" (unggah rekaman kuliah) | Menarik tapi menambah ruang lingkup besar |
| E7 | Papan dosen: lihat halaman mana yang paling sering jadi celah seluruh kelas | **Tinggi** — ini bisa jadi bab tambahan atau penelitian lanjutan |
| E8 | PWA / tampilan mobile | Tinggi untuk kegunaan, nol untuk kebaruan |

---

## F. Yang sebaiknya TIDAK dibuat (atau tidak diklaim baru)

| Fitur | Alasan |
|---|---|
| Kuis dari PDF dengan LLM sebagai **klaim kebaruan** | Sudah ada: APUOPE-RE (Al-gburi 2025), Quiz-Tube (2025), Intelliquiz (2026), survei Pinjarkar dkk. (2026). Tetap dibangun, tapi jangan diklaim baru. |
| Dwibahasa sebagai klaim kebaruan | Itu urusan prompt, bukan kontribusi ilmiah. |
| Gamifikasi sebagai klaim kebaruan | Sudah ada di Intelliquiz. |
| AI meringkas slide jadi catatan sebagai **jalur utama** | Membunuh fitur inti + bertentangan dengan Chen dkk. (2025). |
| Kolaborasi multi-pengguna, rekomendasi materi eksternal, *knowledge tracing*, aplikasi mobile native | Memperbesar ruang lingkup tanpa menambah kebaruan. |

---

## G. Prioritas

**MVP skripsi (wajib selesai) —** F0 → F1 → F2 → F3 → F4 → F5 → F6 → F7
**Pendukung wajib —** S1, S2, S4, S5, S6, S9, S10
**Penguat demo —** F8, D4, D5, E2
**Kalau sempat —** D7, E5, E7

Urutan pengerjaan yang disarankan: **F0 dan F1 lebih dulu dan tuntas.** Keduanya tidak butuh AI yang pintar, tapi semua fitur lain bergantung padanya. Kalau F1 tidak menghasilkan poin yang rapi beserta nomor halaman, F2 sampai F8 akan dibangun di atas pasir.

---

## H. Perubahan skema Prisma yang diperlukan

Sketsa, bukan final:

```prisma
model Material {                      // slide dosen — sumber kebenaran
  id          Int      @id @default(autoincrement())
  userId      Int      @map("user_id")
  title       String   @db.VarChar(200)
  filePath    String   @db.Text @map("file_path")
  fileType    String   @db.VarChar(20) @map("file_type")
  pageCount   Int?     @map("page_count")
  status      String   @default("pending")   // pending|processing|done|failed
  createdAt   DateTime @default(now()) @map("created_at")

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  points      SlidePoint[]
  notes       Note[]
  @@map("materials")
}

model SlidePoint {                    // satu klaim dari satu halaman slide
  id          Int      @id @default(autoincrement())
  materialId  Int      @map("material_id")
  page        Int
  orderIndex  Int      @map("order_index")
  pointType   String   @map("point_type")    // definisi|rumus|proses|contoh|klasifikasi|syarat
  text        String   @db.Text
  sourceQuote String?  @db.Text @map("source_quote")

  material    Material  @relation(fields: [materialId], references: [id], onDelete: Cascade)
  gaps        NoteGap[]
  @@index([materialId, page])
  @@map("slide_points")
}

model NoteGap {                       // hasil perbandingan catatan vs satu poin slide
  id            Int       @id @default(autoincrement())
  noteId        Int       @map("note_id")
  slidePointId  Int       @map("slide_point_id")
  status        String                            // covered|partial|incorrect|missing|dismissed
  confidence    Float?
  aiReason      String?   @db.Text @map("ai_reason")
  noteEvidence  String?   @db.Text @map("note_evidence")
  closedAt      DateTime? @map("closed_at")       // terisi saat celah berhasil ditutup (F6)
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  note          Note       @relation(fields: [noteId], references: [id], onDelete: Cascade)
  slidePoint    SlidePoint @relation(fields: [slidePointId], references: [id], onDelete: Cascade)
  @@unique([noteId, slidePointId])
  @@map("note_gaps")
}

model CoverageSnapshot {              // untuk grafik sebelum/sesudah di Bab Hasil
  id          Int      @id @default(autoincrement())
  noteId      Int      @map("note_id")
  covered     Int
  partial     Int
  incorrect   Int
  missing     Int
  dismissed   Int
  score       Float
  takenAt     DateTime @default(now()) @map("taken_at")
  @@map("coverage_snapshots")
}
```

Perubahan pada model yang sudah ada:

```prisma
enum SourceType { topic  note  gap }        // + gap

model Note {
  materialId  Int?  @map("material_id")     // + tautan ke slide sumber
  isAiGenerated Boolean @default(false) @map("is_ai_generated")  // + penanda F0
}

model QuizQuestion {
  slidePointId Int?  @map("slide_point_id") // + asal-usul soal
  slidePage    Int?  @map("slide_page")     // + untuk F5
  gapId        Int?  @map("gap_id")
}

model QuizResult {
  // buang @@unique([userId, quizId]) atau tambah attemptNumber (lihat D4)
}
```

---

## I. Risiko teknis terbesar

1. **Membedakan "catatan keliru" dari "catatan ringkas padat".**
   "Osmosis = air pindah ke pekat" itu ringkas, bukan salah. Kalau sistem menuduhnya keliru, kepercayaan pengguna langsung hilang.
   *Penanganan:* F4 (bukti + keyakinan + tombol bantah) bukan fitur tambahan — ini pengaman.

2. **Pemecahan poin yang tidak konsisten.** Gemini bisa memecah halaman yang sama jadi 4 poin hari ini dan 9 poin besok, sehingga Skor Kelengkapan tidak stabil.
   *Penanganan:* suhu rendah, prompt dengan contoh tetap, dan **simpan hasil ekstraksi sekali saja** (S8) — jangan ekstrak ulang tiap kali menilai.

3. **Slide hasil pindai / penuh gambar** menghasilkan nol poin. Perlu S3 + pesan kesalahan yang jelas, bukan gagal diam-diam.

4. **Biaya & kuota Gemini.** F1 dan F2 jauh lebih boros daripada fitur yang ada sekarang. Penyaringan dua tahap di F2 dan cache di S8 bukan optimasi — itu keharusan.

5. **Waktu proses.** Materi 50 halaman bisa makan beberapa menit. Tanpa S4 (antrean + status), request akan timeout dan pengguna mengira aplikasinya rusak.

6. **`public/uploads/` tidak aman dan tidak awet** (S6). Perlu diperbaiki sebelum demo, bukan sesudah.
