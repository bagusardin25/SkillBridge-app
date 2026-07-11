# SkillBridge — Analisis Produk & Strategi SaaS

**Versi dokumen:** 1.0  
**Tanggal:** 11 Juli 2026  
**Lingkup:** Usulan fitur, perbaikan UI/UX, strategi SaaS jangka panjang, dan perbandingan kompetitor  

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Gambaran Produk Saat Ini](#2-gambaran-produk-saat-ini)
3. [Analisis Kekuatan & Kesenjangan](#3-analisis-kekuatan--kesenjangan)
4. [Usulan Fitur Tambahan](#4-usulan-fitur-tambahan)
5. [Saran Perbaikan UI/UX](#5-saran-perbaikan-uiux)
6. [Strategi Jangka Panjang Menuju SaaS](#6-strategi-jangka-panjang-menuju-saas)
7. [Perbandingan Kompetitor](#7-perbandingan-kompetitor)
8. [Roadmap Implementasi yang Direkomendasikan](#8-roadmap-implementasi-yang-direkomendasikan)
9. [Metrik Keberhasilan & Risiko](#9-metrik-keberhasilan--risiko)
10. [Kesimpulan](#10-kesimpulan)

---

## 1. Ringkasan Eksekutif

**SkillBridge** adalah aplikasi web AI-powered yang mengubah tujuan belajar (natural language) menjadi **roadmap visual interaktif**, dilengkapi resource terkurasi, quiz, AI tutor, gamifikasi (XP/level/streak/badge), dan fitur share/export/sertifikat.

Produk ini sudah melewati fase “MVP yang kaya fitur” dan berada di **fase beta pra-monetisasi**:

| Aspek | Status |
|--------|--------|
| Core learning loop (generate → belajar → quiz → progress) | ✅ Fungsional |
| Auth (email + OAuth Google/GitHub) | ✅ Ada |
| Billing UI (FREE / PRO / ENTERPRISE) | ⚠️ Tampilan saja; pembayaran belum aktif |
| Enforcement kuota per tier | ❌ Belum (semua user akses setara Pro) |
| Kolaborasi tim real-time | ❌ Non-goal saat ini |
| Analytics funnel / product analytics | ❌ Belum |
| Multi-tenant / org workspace | ❌ Belum |

**Posisi strategis yang disarankan:**  
Jadikan SkillBridge **“AI Learning Workspace”** untuk self-learner tech (bukan sekadar generator roadmap statis). Differensiasi utama melawan `roadmap.sh` adalah **personalization + accountability loop** (preferensi AI, prasyarat node, quiz gate, XP/streak, sertifikat, project workspace), dengan harga yang kompetitif di segmen Pro (~$8–12/bulan).

**Prioritas 90 hari ke depan (ringkas):**

1. Monetisasi: kuota + Stripe + enforcement tier  
2. Onboarding & activation (time-to-first-roadmap < 2 menit)  
3. Learning loop yang lebih “lengkap” (adaptive path, daily plan, reminder)  
4. Diferensiasi jelas vs roadmap.sh (workspace mendalam vs katalog komunitas)  
5. Fondasi B2B ringan (team workspace, admin dashboard) untuk jalur Enterprise

---

## 2. Gambaran Produk Saat Ini

### 2.1 Value Proposition

> *Describe your goal → AI builds a personalized, interactive learning path with resources, quizzes, and an AI tutor.*

Menyelesaikan pain point self-learner:

- Urutan belajar tidak jelas  
- Resource berlimpah tapi tidak terfilter  
- Tidak ada akuntabilitas / progress yang terukur  
- Tidak ada tutor konteks saat stuck  

### 2.2 Fitur yang Sudah Ada

| Domain | Fitur |
|--------|--------|
| **AI Generation** | Generate roadmap dari natural language; preferensi skill level, waktu, gaya belajar, goal; dual provider OpenAI + Gemini fallback |
| **Canvas** | React Flow: drag/zoom/pan, custom nodes/edges, auto-layout, undo/redo, minimap, progress visual |
| **Resources** | Enrichment YouTube + Dev.to + docs; type tagging |
| **AI Tutor** | Chat project-level & node-level; streaming SSE; markdown + syntax highlight; history persist |
| **Quiz** | 5 soal MCQ/topik; timer; pass threshold; cache; auto-complete node + XP |
| **Gamifikasi** | XP, level, streak, learning minutes, badges, certificate PDF |
| **Workspace** | Project → Roadmap; notes per node; save/export PNG; share public URL |
| **Auth & Security** | JWT, OAuth, email verify, reset password, Helmet, rate limit |
| **i18n & Theme** | EN/ID, dark/light |
| **Landing** | Hero interaktif, typewriter, scroll reveal, social proof marquee, comparison section |

### 2.3 Tech Stack (relevan untuk SaaS)

| Layer | Stack |
|-------|--------|
| Frontend | React 19, Vite, Tailwind, shadcn/Radix, React Flow, Zustand |
| Backend | Express + TypeScript, Prisma, PostgreSQL |
| AI | OpenAI GPT-4o-mini (primary), Gemini (fallback) |
| Hosting | Vercel (FE), Railway (BE + DB) |
| CI | GitHub Actions (typecheck + unit tests) |

### 2.4 Model data (ringkas)

```
User ──1:N── Project ──1:N── Roadmap
                              ├── QuizResult
                              ├── ChatMessage
                              └── NodeNote
```

`User.tier` sudah ada (`FREE` | `PRO` | `ENTERPRISE`), tetapi **belum dipakai untuk membatasi fitur/kuota di API**.

### 2.5 Pricing yang sudah dirancang di UI

| Plan | Harga (UI) | Klaim fitur |
|------|------------|-------------|
| **FREE** | $0 / Rp 0 | 3 projects, basic AI, quiz, community support |
| **PRO** | $9.99 / Rp 99.000 | Unlimited projects, priority AI, analytics, export PDF, email support |
| **ENTERPRISE** | Custom | Team collab, SSO, branding, dedicated support |

> Catatan: selama beta, semua user mendapat akses setara Pro. Ini bagus untuk validasi, **berbahaya** untuk unit economics AI bila skala naik tanpa hard limits.

---

## 3. Analisis Kekuatan & Kesenjangan

### 3.1 Kekuatan (moat potensial)

1. **End-to-end learning workspace** — bukan hanya diagram; ada quiz gate, notes, tutor, progress, sertifikat dalam satu flow.  
2. **Personalization depth** — preferensi skill/time/style/goal di-prompt ke AI (bukan template generik).  
3. **Visual canvas sebagai “home base”** — mental model kuat: peta keterampilan yang hidup.  
4. **Dual AI provider** — resilience & cost control awal.  
5. **i18n ID/EN** — entry point pasar Indonesia + global tech learners.  
6. **Gamifikasi ringan** — streak/XP mengurangi churn early-stage.  
7. **Foundation SaaS sudah partial** — tier enum, billing page, roles (USER/ADMIN/MODERATOR).

### 3.2 Kelemahan / technical debt produk

| Area | Masalah | Dampak |
|------|---------|--------|
| **Monetisasi** | Billing beta; tidak ada Stripe/payment; tier tidak di-enforce | Tidak ada revenue; cost AI tidak terkontrol |
| **Authorization** | Spec menyebut inkonsistensi `userId` di beberapa endpoint | Risiko keamanan & multi-user integrity |
| **Analytics** | Tidak ada funnel tracking (activation, retention cohort) | Keputusan product “buta” |
| **Konten komunitas** | Tidak ada marketplace/template ranking/komunitas | Sulit network effect ala roadmap.sh |
| **Adaptive learning** | Path tidak menyesuaikan setelah quiz gagal/lulus | Kurang “AI” di loop pasca-generate |
| **Kolaborasi** | Enterprise promise collab/SSO, backend belum ada | Klaim marketing vs realitas |
| **Mobile** | Responsive ada, tetapi canvas-heavy UX kurang ideal di ponsel | Conversion mobile rendah |
| **Testing** | ~25 unit tests (auth + business logic); coverage route/e2e terbatas | Risiko regresi saat scaling fitur |
| **Notification** | Settings notifikasi/UI account deletion partial | Trust & re-engagement lemah |
| **Resource quality** | Enrichment otomatis bisa tidak relevan / outdated | Trust terhadap konten menurun |

### 3.3 Opportunity window

Pasar **AI learning path tools** sedang memanas (2025–2026): roadmap.sh sudah premium (~$8.33/bln yearly), Coursera/Udemy kuat di konten terkurasi tapi lemah di “AI path personal + visual workspace”, LMS enterprise (Docebo, 360Learning) terlalu berat & mahal untuk individual.  

SkillBridge bisa mengisi celah:

> **Individual & small-team tech upskilling** dengan **AI-generated visual roadmap + mastery loop**, harga mid-market, UX modern.

---

## 4. Usulan Fitur Tambahan

Prioritas: **P0** (must untuk SaaS), **P1** (diferensiasi 3–6 bulan), **P2** (expand & defend), **P3** (vision).

### 4.1 P0 — Fondasi monetisasi & trust

| Fitur | Deskripsi | Mengapa penting |
|-------|-----------|-----------------|
| **Tier enforcement + usage quotas** | FREE: max 3 projects, N generate/bulan, M chat messages/hari; PRO unlimited (fair use); log usage di DB | Menjadikan plan bermakna; mengontrol cost AI |
| **Stripe / Midtrans billing** | Checkout, webhook, subscription lifecycle, invoice, cancel/resume | Revenue path nyata (global + ID) |
| **Usage dashboard** | “Sisa kuota AI minggu ini”, history usage | Transparansi → konversi upgrade |
| **Hardening authorization** | Semua resource scoped ke `req.user.id`; hilangkan trust `userId` dari client | Keamanan multi-tenant |
| **Email lifecycle** | Welcome, streak at risk, weekly digest, “quiz unfinished” | Retention tanpa fitur berat |
| **Product analytics** | PostHog/Mixpanel: signup → first generate → first quiz → D7 | Data-driven roadmap |

### 4.2 P1 — Memperdalam learning loop (diferensiasi utama)

| Fitur | Deskripsi | Mengapa penting |
|-------|-----------|-----------------|
| **Adaptive roadmap** | Setelah quiz gagal → AI menyisipkan node remedial; lulus cepat → skip optional | “Personalized” jadi dinamis, bukan sekali generate |
| **Daily Learning Plan** | Dari roadmap + preferensi waktu, generate checklist harian (30–60 menit) | Mengurangi decision fatigue; naikkan streak |
| **Skill assessment onboarding** | Pre-test singkat sebelum generate | Roadmap lebih akurat; perceived value naik |
| **Spaced repetition / review queue** | Node yang sudah lulus muncul lagi untuk review ringkas | Retensi pengetahuan jangka panjang |
| **Project-based milestones** | Node “project” dengan checklist deliverable + AI review rubric | Outcome-oriented (portfolio), bukan hanya teori |
| **AI study buddy modes** | Mode: Explain like I’m 5 / Interview coach / Code review / Debug | Meningkatkan utility chat |
| **Resource quality signals** | Rating resource, “mark as useful”, auto-rank | Meningkatkan kualitas konten organik |
| **Import from roadmap.sh / URL** | Import outline publik lalu personalisasi dengan AI | Menurunkan switching cost dari kompetitor |

### 4.3 P1 — Growth & viral loops

| Fitur | Deskripsi |
|-------|-----------|
| **Public template gallery** | Template curated + user-published (dengan rating) |
| **Fork roadmap** | Satu klik clone public roadmap ke workspace sendiri |
| **Embed widget** | Embed progress roadmap di Notion/blog/portfolio |
| **LinkedIn share certificate** | One-click post sertifikat + open graph preview |
| **Referral program** | +1 bulan Pro untuk referrer & referee |

### 4.4 P2 — Kolaborasi & B2B entry

| Fitur | Deskripsi |
|-------|-----------|
| **Team workspace** | Org, seats, shared roadmaps |
| **Mentor / coach view** | Mentor melihat progress mentee (read-only + comments) |
| **Assignment mode** | Admin assign roadmap ke cohort (bootcamp, campus, company L&D) |
| **Progress report export** | CSV/PDF untuk manager |
| **SSO (SAML/OIDC)** | Syarat enterprise |
| **Custom branding** | Logo, domain, warna (white-label light) |
| **SCORM / LMS export** (opsional) | Bridge ke LMS perusahaan |

### 4.5 P2 — Kualitas AI & konten

| Fitur | Deskripsi |
|-------|-----------|
| **Multi-model routing** | Cheap model untuk chat ringan; strong model untuk generate/quiz |
| **RAG knowledge base** | Upload silabus/PDF/job description → roadmap aligned |
| **Live coding sandbox** (fase lanjut) | Embed StackBlitz/CodeSandbox di node practice |
| **Domain expansion** | Mulai dari tech → design, data analytics, digital marketing (setelah quality control) |
| **Offline / PWA** | Cache roadmap untuk belajar tanpa jaringan stabil |

### 4.6 P3 — Vision (12–24 bulan)

- **Marketplace mentor** (session 1:1)  
- **Job-ready score** vs job description (skill gap analyzer B2B)  
- **Mobile native app** (setelah web mobile UX matang)  
- **API public** untuk partner edtech/bootcamp  
- **AI agent “learning manager”** yang proaktif menyesuaikan path mingguan  

### 4.7 Matriks prioritas (Impact × Effort)

```
                    HIGH IMPACT
                         │
   Adaptive path  ●      │  ● Stripe + quotas
   Daily plan     ●      │  ● Auth hardening
   Template gallery ●    │  ● Onboarding assessment
                         │
 LOW EFFORT ─────────────┼───────────── HIGH EFFORT
                         │
   Embed/share polish ●  │  ● Team collab + SSO
   Email digest   ●      │  ● Coding sandbox
                         │  ● Mobile app
                         │
                    LOW IMPACT
```

---

## 5. Saran Perbaikan UI/UX

### 5.1 Prinsip desain yang disarankan

1. **One primary action per screen** — di empty state: “Generate roadmap”, bukan deretan ikon.  
2. **Progress always visible** — progress bar global + “next recommended node”.  
3. **Canvas sebagai stage, bukan labirint** — kurangi chrome UI; action sekunder di overflow.  
4. **Mobile-first learning moments** — di ponsel, prioritaskan list/timeline mode; canvas opsional.  
5. **Trust & clarity** — jelaskan mengapa AI merekomendasikan urutan; tampilkan estimated time realistis.

### 5.2 Onboarding & Activation

| Masalah saat ini | Usulan |
|------------------|--------|
| Setelah register, user langsung ke canvas kosong | **Guided onboarding 3 langkah**: goal → preferences → generate (progress indicator) |
| Landing input goal → register, goal bisa hilang | Persist `?goal=` sampai post-auth auto-fill generate |
| Template ada di data, discoverability rendah | **Empty state** dengan template cards + “or describe your goal” |
| Tidak ada empty-state edukatif | Tooltip coach marks: “Klik node → Resources → Quiz” |

**Target:** *Time to first meaningful roadmap ≤ 90 detik* setelah signup.

### 5.3 Workspace & Canvas

| Area | Usulan |
|------|--------|
| **Dual mode view** | Toggle **Map** (React Flow) ↔ **Path list** (linear checklist dengan status) — list lebih baik di mobile & power users |
| **Focus mode** | Sembunyikan sidebar/header; hanya node aktif + AI tutor + timer pomodoro |
| **Next step CTA** | Floating chip: “Lanjutkan: HTML Forms (estimasi 45 mnt)” |
| **Prerequisite clarity** | Visual lock + tooltip “Selesaikan X dulu”; jangan biarkan user bingung kenapa quiz locked |
| **Node density** | Collapse phase groups; expand on demand (hindari spaghetti graph) |
| **Keyboard shortcuts** | `N` next node, `Q` quiz, `C` chat, `⌘S` save — power user retention |
| **Autosave indicator** | “Saved 2s ago” di header (trust) |

### 5.4 Node Detail Panel

| Area | Usulan |
|------|--------|
| Tab hierarchy | Default tab **Learn** (deskripsi + resources ranked), lalu Tutor, Notes, Quiz |
| Resource cards | Thumbnail YouTube, estimated read time, difficulty badge, “Start” primary button |
| Progress in panel | Mini checklist: Resources opened / Notes written / Quiz passed |
| Quiz entry | Preview “5 questions · ~8 min · Pass 90%” sebelum start (expectation setting) |
| After quiz fail | Immediate CTA: “Tinjau jawaban” + “Minta penjelasan AI” + “Jadwalkan review” |
| Width desktop | Pertimbangkan panel 360–400px atau split view untuk chat panjang |

### 5.5 AI Tutor Chat

| Area | Usulan |
|------|--------|
| Suggested prompts | Chip: “Jelaskan sederhana”, “Contoh kode”, “Soal latihan”, “Kaitkan dengan node sebelumnya” |
| Context pill | Selalu tampilkan “Menjawab dalam konteks: React Hooks” |
| Streaming UX | Skeleton lines + stop button lebih menonjol |
| Feedback loop | Like/dislike → fine-tune prompt routing (dan confidence badge) |
| History search | Cari di chat history per project |
| Cost awareness (Pro) | Soft warning mendekati fair-use limit |

### 5.6 Gamifikasi & Profile

| Area | Usulan |
|------|--------|
| Streak protection | 1 “freeze” per minggu (Pro) — mengurangi guilt churn |
| Badge celebration | Full-screen confetti modal singkat + share |
| Level progress | Progress ke level berikutnya di header/sidebar (selalu terlihat) |
| Weekly report | Kartu “Minggu ini: 4 topik, 3 jam, streak 5” di dashboard |
| Certificate | Preview LinkedIn-ready; verifikasi publik `skillbridge.app/c/:id` |

### 5.7 Landing & Marketing UX

| Area | Usulan |
|------|--------|
| Social proof | Ganti marquee tech stack dengan **user outcomes** (job switch, projects shipped) begitu ada data |
| Demo interaktif | Mini generate tanpa login (rate-limited) → frictionless aha moment |
| Pricing di landing | Bandingkan Free vs Pro secara transparan; sebut fair use AI |
| SEO pages | Programmatic pages: “Learn React roadmap”, “Go backend path” |
| Trust | Status page AI uptime, privacy policy jelas (data chat/roadmap) |

### 5.8 Mobile UX (kritis)

Canvas-first di mobile sering frustasi. Usulan pola:

1. **Default mobile = Timeline/List**  
2. Tap node → bottom sheet (resources/quiz/tutor)  
3. “Map view” sebagai secondary  
4. Thumb-zone: primary CTA di bawah  
5. Kurangi nested fullscreen overlays yang saling menutupi  

### 5.9 Accessibility & polish

- Kontras dark mode pada edges/nodes (WCAG AA)  
- Focus ring keyboard di canvas controls  
- `prefers-reduced-motion` untuk landing animations  
- Loading skeletons konsisten di project list, generate, quiz  
- Error states actionable (“Quota AI habis → Upgrade” / “Retry with Gemini”)  

### 5.10 Information architecture usulan

```
/app
  ├── Home / Continue learning          ← BARU (dashboard harian)
  ├── Projects
  │     └── Roadmap workspace (map|list)
  ├── Explore templates                 ← BARU
  ├── Progress & badges
  ├── AI usage & billing
  └── Settings
```

Sidebar saat ini project-centric — bagus, tapi kurang **“what should I do today?”**. Tambahkan Home ringkas di atas daftar project.

---

## 6. Strategi Jangka Panjang Menuju SaaS

### 6.1 Visi 3 tahun

> **SkillBridge menjadi OS pembelajaran personal & tim kecil** untuk skill tech: dari goal → path adaptif → mastery → bukti (portfolio/sertifikat/skill score).

### 6.2 Positioning

| | B2C (utama awal) | B2B (fase 2) |
|--|------------------|--------------|
| **Siapa** | Self-learner, career switcher, bootcamp student | Bootcamp, campus, startup L&D, agency training |
| **Job-to-be-done** | “Saya tahu mau ke mana, tapi tidak tahu urutan & konsistensi” | “Kami butuh track skill karyawan/siswa tanpa LMS berat” |
| **Willingness to pay** | $8–15/bulan | $8–20/seat/bulan atau flat team |

**Positioning statement:**  
*For ambitious tech learners who outgrow static roadmaps, SkillBridge is the AI learning workspace that turns any skill goal into an adaptive visual path with quizzes, tutoring, and measurable progress — unlike roadmap.sh (catalog-first) or Coursera (course-catalog-first).*

### 6.3 Model bisnis

#### A. Subscription (inti)

| Plan | Harga usulan | Batas (contoh) |
|------|--------------|----------------|
| **Free** | $0 | 3 projects, 3 AI generates/bulan, 20 chat/hari, quiz unlimited, branding watermark di share |
| **Pro** | **$9.99/mo** atau **$79/yr** (~$6.6/mo) | Unlimited projects, higher AI limits, adaptive path, daily plan, no watermark, streak freeze, priority |
| **Team** | **$12/seat/mo** (min 3 seats) | Shared workspace, mentor view, reports |
| **Enterprise** | Custom | SSO, branding, SLA, admin API, custom data retention |

> Harga Pro selaras dengan roadmap.sh Premium (~$8.33/mo yearly) — jangan undercut terlalu dalam; kalahkan dengan **depth of workspace**, bukan race-to-zero.

#### B. Revenue adjacencies (nanti)

- Add-on AI packs (top-up generate)  
- Template marketplace fee (creator 70% / platform 30%)  
- Mentor marketplace take rate  
- White-label / API partner  

#### C. Unit economics (wajib diukur)

| Metrik | Target awal |
|--------|-------------|
| Gross margin | > 70% setelah AI cost |
| AI cost / paid user / month | < 20–25% ARPU |
| CAC payback | < 3 bulan |
| Free → Pro conversion | 3–7% (healthy early SaaS) |
| Monthly churn Pro | < 5% |

**Taktik cost control AI:**

- Cache generate serupa (semantic cache)  
- Model routing (cheap vs strong)  
- Rate limit per tier (bukan hanya per IP)  
- Prompt compression & max tokens dinamis  
- Preferensi “economy mode” di Free  

### 6.4 Go-to-Market (GTM)

#### Fase 0–3 bulan: Product-led growth (PLG)

1. **Launch monetisasi** dengan soft paywall (generous free tier)  
2. **SEO + programmatic landing** untuk keyword “learn X roadmap”, “AI learning path”  
3. **Content**: case study “0 → junior frontend in 12 weeks with SkillBridge”  
4. **Community**: Discord/Telegram ID + EN; weekly public roadmap challenges  
5. **Distribution**: Product Hunt, Indie Hackers, Twitter/X tech, Dev.to, Hacker News Show HN  
6. **Partnership**: coding bootcamp lokal (Indonesia) sebagai design partners  

#### Fase 3–9 bulan: Expansion

1. Template gallery + creator program  
2. Integrasi Notion / GitHub (export issues dari project nodes)  
3. Campus ambassador program  
4. Case study B2B kecil (1–2 bootcamp)  

#### Fase 9–18 bulan: B2B motion

1. Team plan + admin dashboard  
2. Sales-assisted untuk Enterprise  
3. Compliance dasar (SOC2 path, DPA, data residency option)  

### 6.5 Tahapan produk SaaS (maturity model)

```
Stage 1          Stage 2           Stage 3            Stage 4
Single-player →  Monetized PLG  →  Multiplayer/Team → Platform
(sekarang+)      (kuota+Stripe)    (org seats)         (API/marketplace)
```

| Stage | Exit criteria |
|-------|----------------|
| 1 | Activation > 40%, D7 retention terukur |
| 2 | First $1k MRR, paywall stabil, churn terukur |
| 3 | 5+ team customers paying |
| 4 | External API or marketplace GMV |

### 6.6 Organisasi data & arsitektur SaaS

Rekomendasi evolusi teknis (bertahap, jangan big-bang):

1. **Usage & billing tables** — `UsageEvent`, `Subscription`, `Invoice`  
2. **Org model** — `Organization`, `Membership`, `Seat`  
3. **RBAC** — role per org (owner/admin/member/mentor)  
4. **Feature flags** — LaunchDarkly/Unleash atau homegrown  
5. **Observability** — Sentry + OpenTelemetry + AI cost dashboard  
6. **Queue** — BullMQ/Redis untuk generate async (UX lebih baik, retry aman)  
7. **CDN & asset** — avatar/certificate di object storage (S3/R2)  
8. **Background jobs** — streak email, weekly digest, subscription sync  

### 6.7 Legal & trust (sering diabaikan)

- ToS & Privacy (AI data usage jelas)  
- Cookie consent jika analytics EU  
- Refund policy subscription  
- Content moderation policy (sudah ada guardrails domain tech/ethical)  
- Certificate anti-fraud (verification page)  

### 6.8 Pasar Indonesia vs Global

| | Indonesia | Global |
|--|-----------|--------|
| Pricing psychology | Rp 49–99rb/bln sweet spot | $9–12/mo |
| Payment | Midtrans, QRIS, e-wallet | Stripe card |
| Channel | TikTok Edu, IG, kampus, bootcamp | SEO, Product Hunt, Twitter |
| Language | ID-first UX quality | EN quality + lokal lainnya belakangan |

**Saran:** Dual pricing display sudah ada (EN $ / ID Rp) — pertahankan; pastikan **payment rails lokal** agar konversi ID tidak mati di kartu kredit.

---

## 7. Perbandingan Kompetitor

### 7.1 Peta kompetitif

```
                    HIGH PERSONALIZATION (AI path)
                              │
              SkillBridge ●   │   ● roadmap.sh AI/Premium
                              │
  VISUAL/     ────────────────┼────────────────  COURSE
  WORKSPACE                   │                  CATALOG
                              │
                 Notion+AI ●  │   ● Coursera / Udemy
                 Mindmap tools│   ● LinkedIn Learning
                              │
                    LOW PERSONALIZATION
```

### 7.2 Kompetitor utama

#### 1) roadmap.sh (+ Premium / AI Tutor)

| Aspek | Detail |
|-------|--------|
| **Kekuatan** | Brand dominan di dev community; ratusan role/skill roadmaps; SEO luar biasa; progress tracking; AI tutor & personalized courses; harga Pro ~**$8.33/mo** (yearly) / ~$100/yr |
| **Kelemahan** | Roadmap komunitas cenderung generik; workspace personal kurang “deep” dibanding tool editor penuh; kurang gamifikasi & project-centric learning |
| **Ancaman bagi SkillBridge** | Tinggi — overlap fitur AI tutor + custom roadmap |
| **Cara beda** | SkillBridge = **personalized graph workspace + mastery gates + project container + bilingual ID**; “belajar di dalam peta” bukan “centang katalog” |

#### 2) Coursera / Coursera Plus

| Aspek | Detail |
|-------|--------|
| **Kekuatan** | Konten universitas & industri; sertifikat diakui; path career; brand trust |
| **Kelemahan** | Mahal relatif (Plus ~$59/mo atau ~$399/yr); path kurang fleksibel; bukan canvas visual; AI personalization terbatas dibanding native AI tools |
| **Posisi vs SkillBridge** | Adjacent, bukan head-to-head; SkillBridge lebih “build your path”, Coursera “consume courses” |

#### 3) Udemy / Udemy Business

| Aspek | Detail |
|-------|--------|
| **Kekuatan** | Volume kursus, harga promo, B2B library |
| **Kelemahan** | Kualitas bervariasi; path tidak terintegrasi; completion rate rendah |
| **SkillBridge angle** | Kurasi path AI + accountability, bukan katalog raksasa |

#### 4) LinkedIn Learning

| Aspek | Detail |
|-------|--------|
| **Kekuatan** | Integrasi profil LinkedIn, brand profesional |
| **Kelemahan** | Path kaku, kurang AI-native generation dari goal bebas |
| **SkillBridge angle** | Sertifikat + skill proof yang bisa di-share ke LinkedIn dari path custom |

#### 5) LMS enterprise (Docebo, 360Learning, Absorb, Disco)

| Aspek | Detail |
|-------|--------|
| **Kekuatan** | Compliance, analytics L&D, scale perusahaan, AI path untuk employee |
| **Kelemahan** | Mahal, implementasi lama, UX berat untuk individual |
| **SkillBridge angle** | “Lightweight L&D” untuk startup/bootcamp tanpa proyek 6 bulan |

#### 6) Tools diagram / note (Whimsical, Miro, Notion AI)

| Aspek | Detail |
|-------|--------|
| **Kekuatan** | Fleksibel, familiar |
| **Kelemahan** | Bukan learning system (tidak ada quiz mastery, resource enrichment otomatis, streak) |
| **SkillBridge angle** | Purpose-built learning OS |

#### 7) AI course generators (Coursebox, Mini Course Generator, dll.)

| Aspek | Detail |
|-------|--------|
| **Fokus** | Creator membuat course untuk dijual |
| **Beda** | SkillBridge fokus-first learner, bukan creator economy (bisa menyusul lewat marketplace template) |

### 7.3 Matriks fitur (ringkas)

| Kapabilitas | SkillBridge | roadmap.sh | Coursera | Udemy | LMS Enterprise |
|-------------|:-----------:|:----------:|:--------:|:-----:|:--------------:|
| AI generate path dari goal bebas | ✅ | ✅ (AI) | ⚠️ terbatas | ❌ | ⚠️ bervariasi |
| Visual interactive graph editor | ✅ kuat | ✅ (lebih katalog) | ❌ | ❌ | ⚠️ |
| Quiz mastery per node | ✅ | ✅ (premium) | ✅ (course) | ✅ | ✅ |
| AI tutor kontekstual | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Gamifikasi (XP/streak) | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Project workspace multi-roadmap | ✅ | ⚠️ | ❌ | ❌ | ✅ |
| Community roadmaps SEO | ❌ lemah | ✅ sangat kuat | ✅ | ✅ | ❌ |
| Recognized university cert | ❌ | ❌ | ✅ | ⚠️ | ⚠️ |
| Team L&D / SSO | ❌ (direncanakan) | ⚠️ | ✅ Business | ✅ Business | ✅ |
| Harga entry paid | ~$10 (rencana) | ~$8–10 | tinggi | rendah–menengah | tinggi |
| Bahasa Indonesia native | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |

### 7.4 Competitive strategy (apa yang harus dilakukan / dihindari)

**Lakukan:**

1. **Own the “personalized mastery workspace” narrative** — screenshot & demo yang menonjolkan adaptive path + quiz gate + daily plan.  
2. **Indonesia beachhead** — kualitas i18n, payment lokal, partner bootcamp.  
3. **PLG viral** — public share, fork, embed, certificate verify.  
4. **Speed of personalization** — onboarding assessment yang terasa “wow” dalam 2 menit.  
5. **Transparent pricing** selaras pasar, bundling yearly aggressive.

**Hindari:**

1. Perang SEO frontal melawan roadmap.sh di 1000 keyword generik (kalah resource).  
2. Menjadi “Coursera murahan” (katalog kursus) tanpa moat konten.  
3. Free tier terlalu royal tanpa limit AI (bakar margin).  
4. Overbuild Enterprise sebelum PMF B2C.  

### 7.5 Battlecard ringkas (sales/marketing)

**Vs roadmap.sh**  
- *Mereka:* best free catalog & community authority.  
- *Kita:* AI path yang benar-benar menyesuaikan goal + waktu + gaya Anda, dalam workspace project dengan quiz & tutor yang terintegrasi.  
- *Proof point:* side-by-side “same goal, two paths” demo.

**Vs Coursera**  
- *Mereka:* kredensial institusi.  
- *Kita:* fleksibilitas & kecepatan path custom + biaya lebih rendah untuk self-directed learners.  
- *Combo:* SkillBridge untuk struktur harian; Coursera untuk course mendalam bila perlu (positioning complementary).

---

## 8. Roadmap Implementasi yang Direkomendasikan

### Q1 (0–3 bulan) — “Make money & measure”

1. Usage metering + tier enforcement  
2. Stripe (+ Midtrans opsional paralel)  
3. AuthZ audit & fix  
4. Onboarding flow + goal persistence  
5. Home “Continue learning”  
6. Analytics (activation funnel)  
7. Map ↔ List toggle (mobile win)  

**Outcome:** Paid conversion hidup; AI cost terkontrol; data retensi ada.

### Q2 (3–6 bulan) — “Win the learning loop”

1. Adaptive roadmap post-quiz  
2. Daily learning plan + email/push digest  
3. Skill assessment onboarding  
4. Template gallery + fork  
5. Certificate public verification  
6. Resource rating  
7. AI model routing & semantic cache  

**Outcome:** Retention D30 naik; diferensiasi jelas vs katalog statis.

### Q3 (6–9 bulan) — “Grow & multiplayer light”

1. Team seats (basic)  
2. Mentor view  
3. Referral program  
4. Embed + LinkedIn share polish  
5. RAG upload (job desc / silabus)  
6. Expanded automated tests + e2e  

**Outcome:** First B2B revenue; viral coefficient > 0.

### Q4 (9–12 bulan) — “Platform foundation”

1. SSO & branding  
2. Admin analytics for orgs  
3. Public API beta  
4. Domain expansion terbatas (non-dev skills)  
5. Performance & multi-region readiness  

---

## 9. Metrik Keberhasilan & Risiko

### 9.1 North-star metric

**Weekly Learning Actions (WLA)** = jumlah aksi belajar bermakna per minggu  
(contoh: quiz submit + node complete + ≥5 min tutor chat + resource open)

Alternatif north-star: **Weekly Active Learners with ≥1 completed node**.

### 9.2 Funnel metrics

| Stage | Metrik | Target awal |
|-------|--------|-------------|
| Acquisition | Signup conversion from landing | > 15% visitors yang start journey |
| Activation | % generate roadmap ≤ 24 jam | > 50% |
| Activation+ | % complete first quiz ≤ 7 hari | > 25% |
| Engagement | WAU / MAU | > 40% |
| Retention | D7 / D30 | > 25% / > 12% |
| Monetization | Free→Pro | > 4% |
| Revenue | MRR growth MoM | > 15% early stage |

### 9.3 Risiko utama & mitigasi

| Risiko | Mitigasi |
|--------|----------|
| AI cost meledak | Quota keras, cache, model routing, fair use |
| Kompetitor copy fitur | Speed + brand niche (ID) + community templates |
| Kualitas roadmap buruk | Human-in-the-loop templates, rating, eval set otomatis |
| Churn setelah “wow generate” | Daily plan, streak, email, adaptive path |
| Security multi-tenant | AuthZ review, penetration test sebelum Team plan |
| Dependency OpenAI | Dual provider sudah ada; tambah abstraksi ketat + budget cap |

---

## 10. Kesimpulan

SkillBridge sudah memiliki **fondasi produk yang kuat** untuk kategori AI learning workspace: generate path, visual canvas, tutor, quiz, gamifikasi, i18n, dan kerangka tier/billing. Kesenjangan terbesar menuju SaaS bukan “kurang fitur marketing”, melainkan:

1. **Monetisasi & enforcement kuota yang nyata**  
2. **Learning loop adaptif pasca-generate** (agar bukan one-shot novelty)  
3. **Activation/onboarding yang meminimalkan empty canvas**  
4. **Positioning tajam melawan roadmap.sh** lewat depth workspace + pasar bilingual  
5. **Jalur B2B bertahap** tanpa mengorbankan PMF B2C  

Jika eksekusi 90 hari fokus pada **paywall + metering + onboarding + continue-learning UX**, produk ini berada di jalur yang kredibel menuju SaaS berkelanjutan dengan ARPU ~$8–12 dan opsi ekspansi Team/Enterprise.

---

## Lampiran A — Inventory fitur vs kesiapan SaaS

| Komponen | Ada? | Siap produksi SaaS? | Catatan |
|----------|------|---------------------|---------|
| Auth email/OAuth | Ya | Ya | Pastikan verify email enforced jika perlu |
| JWT session | Ya | Ya | Pertimbangkan refresh token rotation |
| Projects/Roadmaps CRUD | Ya | Ya | |
| AI generate | Ya | Perlu quota | Cost risk |
| Chat streaming | Ya | Perlu quota | Cost risk |
| Quiz | Ya | Ya | Threshold 90% di code vs 80% di spec — selaraskan |
| Billing UI | Ya | Tidak | Toast “soon” |
| Subscription billing | Tidak | — | Prioritas #1 |
| Tier limits | Schema only | Tidak | Enforce di middleware |
| Team/org | Tidak | — | Stage 3 |
| Analytics | Tidak | — | Pasang segera |
| Audit log | Tidak | — | Perlu untuk Enterprise |
| Status/incident page | Tidak | — | Trust |

## Lampiran B — Referensi kompetitor (publik)

- roadmap.sh — developer roadmaps & AI tutor; Premium ~$8.33/mo yearly  
- Coursera Plus — course catalog & career paths (~$59/mo atau ~$399/yr)  
- Udemy / Udemy Business — marketplace kursus  
- LinkedIn Learning — professional catalog  
- LMS AI (360Learning, Docebo, Disco, dll.) — corporate learning paths  
- SkillBridge internal: `README.md`, `PRODUCT_SPECIFICATION.md`, schema Prisma, `BillingPage.tsx`

## Lampiran C — Quick wins (bisa dikerjakan < 2 minggu)

1. Empty state template gallery di `/app`  
2. Persist goal dari landing ke generate dialog  
3. “Continue learning” card di sidebar  
4. Selaraskan quiz pass threshold (docs vs code: 80% vs 90%)  
5. Usage counter stub di UI (meski backend hard-limit belakangan)  
6. Map/List toggle sederhana  
7. Suggested prompts di AI chat  
8. Public certificate verification page  
9. PostHog snippet + 5 event inti  
10. Rate limit AI **per userId + tier**, bukan hanya IP  

---

*Dokumen ini disusun berdasarkan analisis codebase SkillBridge (frontend, backend, schema, billing, product spec) dan riset posisi pasar kompetitor per Juli 2026. Angka harga kompetitor bersifat publik/perkiraan dan dapat berubah; validasi ulang sebelum final pricing decision.*
