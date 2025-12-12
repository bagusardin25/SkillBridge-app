# Masalah Aplikasi SkillBridge

Dokumen ini mencatat masalah-masalah yang ditemukan dalam aplikasi.

---

## 1. Share Roadmap - TIDAK BERFUNGSI

**Lokasi:** `src/components/ui/ShareModal.tsx`

**Masalah:**
- Link share menggunakan URL `/share/${roadmapId}` tetapi tidak ada route/page untuk menampilkan roadmap yang di-share
- Toggle public/private hanya mengubah state lokal, tidak tersimpan ke database
- Tidak ada backend endpoint untuk menangani roadmap publik

**Penyebab:** Fitur belum diimplementasikan sepenuhnya - hanya UI-nya saja yang ada.

---

## 2. Streak System - TIDAK OTOMATIS

**Lokasi:** `src/lib/api.ts` (updateStreak), `server/src/routes/profile.ts`

**Masalah:**
- API updateStreak ada di backend tapi tidak pernah dipanggil dari frontend
- Streak pengguna tidak akan terupdate meskipun mereka aktif setiap hari

**Penyebab:** Tidak ada komponen frontend yang memanggil API streak saat user login/aktif.

---

## 3. Learning Time Tracking - TIDAK DIIMPLEMENTASI

**Lokasi:** `src/lib/api.ts` (addLearningTime)

**Masalah:**
- API addLearningTime ada tapi tidak pernah dipanggil
- Tidak ada mekanisme tracking waktu belajar
- "Hours" di Profile akan selalu menunjukkan 0

**Penyebab:** Tidak ada timer atau tracker yang mengukur waktu belajar pengguna.

---

## 4. Quiz Completion Status - TIDAK TERSINKRONISASI

**Lokasi:** `src/components/quiz/QuizFullScreen.tsx`, `server/src/routes/profile.ts`

**Masalah:**
- Saat quiz passed, status `quizPassed: true` hanya disimpan di React Flow state (memory)
- Status quiz tersimpan di tabel QuizResult secara terpisah dari data node
- Saat page reload/roadmap dibuka ulang, node tidak menampilkan status "completed" karena data quiz tidak di-merge dengan nodes

**Penyebab:** Arsitektur data terpisah antara `Roadmap.nodes` (JSON) dan `QuizResult` table, tanpa proses merge saat loading.

---

## 5. Settings Page - TIDAK ADA

**Lokasi:** `src/components/layout/Sidebar.tsx`

**Masalah:** Menu "Settings" di dropdown user tidak mengarah ke halaman apapun

**Penyebab:** Route dan page Settings belum dibuat.

---

## 6. Billing Page - TIDAK ADA

**Lokasi:** `src/components/layout/Sidebar.tsx`

**Masalah:**
- Menu "Billing" tidak berfungsi
- Tidak ada sistem pembayaran/upgrade tier
- Semua user hardcoded sebagai FREE tier

**Penyebab:** Fitur monetisasi belum diimplementasikan.

---

## 7. Language Selection - TIDAK ADA

**Lokasi:** `src/components/layout/Sidebar.tsx`

**Masalah:** Menu "Language" tidak melakukan apapun

**Penyebab:** Tidak ada sistem internasionalisasi (i18n) yang diimplementasikan.

---

## 8. Profile Progress Calculation - TIDAK AKURAT

**Lokasi:** `server/src/routes/profile.ts` (baris 42-50)

**Masalah:**
- Progress di Profile dihitung hanya berdasarkan quiz yang passed
- Tapi di canvas, node bisa ditandai completed tanpa quiz (untuk optional/project nodes)
- Menyebabkan angka progress berbeda antara Profile dan Header

**Penyebab:** Logika perhitungan tidak konsisten antara frontend dan backend.

---

## 9. Per-Node AI Chat - TIDAK DIMANFAATKAN

**Lokasi:** `server/src/routes/chat.ts`, `src/components/layout/NodeDetailPanel.tsx`

**Masalah:**
- Backend sudah support `nodeId` untuk chat history per node
- Tapi NodeDetailPanel "AI Tutor" tab hanya redirect ke main ChatPanel
- Tidak ada chat history terpisah per topik/node

**Penyebab:** Fitur ada di backend tapi frontend tidak menggunakannya.

---

## 10. Certificate ID - TIDAK PERSISTENT

**Lokasi:** `src/components/ui/CertificateModal.tsx` (baris 77)

**Masalah:**
- Certificate ID menggunakan `Date.now().toString(36)` yang berubah setiap kali modal dibuka
- Sertifikat yang sama akan memiliki ID berbeda setiap dilihat

**Penyebab:** ID di-generate di runtime, bukan disimpan di database.

---

## 11. TypeScript Build Error

**Lokasi:** `src/pages/ProfilePage.tsx` (baris 37)

**Masalah:** Import `Camera` tidak digunakan, menyebabkan error saat build (TS6133)

**Penyebab:** Leftover import dari refactoring sebelumnya.

---

## 12. XP System - PARSIAL

**Lokasi:** `src/components/quiz/QuizFullScreen.tsx`, `server/src/routes/profile.ts`

**Masalah:**
- XP hanya diberikan saat quiz passed (+100 XP)
- Tidak ada XP untuk aktivitas lain (roadmap created, learning time, streak, dll)
- Level-up notification tidak ada

**Penyebab:** Gamification system tidak lengkap.

---

## Ringkasan

| Kategori | Fitur | Status |
|----------|-------|--------|
| Core | Roadmap Generation (AI) | ✅ Berfungsi |
| Core | Quiz System | ⚠️ Partial (status tidak persist) |
| Core | Project Management | ✅ Berfungsi |
| Social | Share Roadmap | ❌ Tidak berfungsi |
| Gamification | Streak | ❌ Tidak aktif |
| Gamification | Learning Time | ❌ Tidak aktif |
| Gamification | XP/Level | ⚠️ Partial |
| Settings | Settings Page | ❌ Tidak ada |
| Settings | Language | ❌ Tidak ada |
| Billing | Subscription/Billing | ❌ Tidak ada |
| AI | Per-Node Chat | ❌ Tidak digunakan |

**Total:** 6 fitur tidak berfungsi, 2 fitur partial, 3 fitur utama berfungsi baik.
