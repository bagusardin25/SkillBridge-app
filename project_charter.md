
PROJECT CHARTER
GENERAL PROJECT INFORMATION
PROJECT NAME: SkillBridge
PROJECT MANAGER: Ida Bagus Giri Krisnabhawa
PROJECT SPONSOR: Universitas (Institusi Pendidikan)
EMAIL: gusgirik@gmail.com
PHONE: 081246793553
GREEN BELTS ASSIGNED: Aldi Rachmatdianto, Peran (UI/UX Designer); Nadif, Peran (Frontend Developer)
BLACK BELTS ASSIGNED: Bagus Ardin Prayoga, Peran (Backend Developer)
ORGANIZATIONAL UNIT(S): IT, Pendidikan, AI
EXPECTED START DATE: 11/15/2025
EXPECTED COMPLETION DATE: 06/12/2026
ESTIMATED COSTS: Rp 5.000.000 (biaya operasional server, API AI, dan domain)
EXPECTED SAVINGS: Rp 15.000.000/tahun (penghematan biaya kursus online bagi pengguna)

PROJECT OVERVIEW
Kategori
Deskripsi
PROBLEM OR ISSUE
Masalah utama yang ingin diselesaikan dari aplikasi ini yaitu banyak orang-orang yang ingin memulai menguasai skill baru mulai dari back-end, front-end, dan lain lain, tapi bingung mulai dari mana. Self-learner sering kesulitan menentukan urutan belajar, kewalahan dengan banyaknya sumber belajar, tidak memiliki visibilitas progres, dan tidak ada bimbingan personal saat mengalami kesulitan.
PURPOSE OF PROJECT
Membangun platform pembelajaran berbasis AI yang mampu menghasilkan roadmap belajar terstruktur dan personal untuk bidang teknologi/programming, sehingga pengguna dapat belajar secara mandiri dengan terarah, terukur, dan efisien.
BUSINESS CASE
Pasar edtech global terus berkembang, dan kebutuhan upskilling di bidang teknologi semakin tinggi. SkillBridge mengisi celah antara kursus online yang mahal/kaku dan belajar mandiri tanpa arah, dengan menyediakan learning path yang dipersonalisasi AI secara gratis (model freemium). Potensi monetisasi melalui model langganan PRO/ENTERPRISE di masa depan.
GOALS/METRICS
1. Activation Rate: ≥60% pengguna baru berhasil membuat roadmap pertama dalam sesi pertama.

2. Engagement: Rata-rata 3+ sesi belajar aktif per minggu per pengguna, dengan streak retention rate ≥40% pada D7.

3. Learning Outcome: ≥70% quiz pass rate dan ≥50% pengguna menyelesaikan minimal 1 roadmap dalam 3 bulan.


PROJECT SCOPE
EXPECTED DELIVERABLES
1. Aplikasi web SkillBridge (frontend + backend) yang fully functional dan ter-deploy ke production.
2. Dokumentasi teknis (Product Specification, API docs, dan panduan deployment).
WITHIN SCOPE
1. Generasi roadmap belajar berbasis AI (OpenAI GPT) untuk topik teknologi/programming.
2. Visual roadmap workspace interaktif (React Flow canvas) dengan fitur drag-drop, undo/redo.
3. Sistem quiz per topik (5 soal pilihan ganda, timer 5 menit, threshold lulus 80%).
4. AI Tutor chat dengan history percakapan dan rendering markdown/code.
5. Sistem gamifikasi (XP, level, streak, badge) dan progress tracking.
6. Autentikasi (email/password + OAuth Google/GitHub) dengan JWT.
7. Fitur sharing roadmap via public URL dan export ke PNG/PDF.
8. Multi-bahasa (Indonesia/Inggris).
9. Dark/Light mode.
OUTSIDE OF SCOPE
1. Sistem pembayaran/langganan aktif (hanya UI perbandingan plan, belum ada transaksi nyata).
2. Fitur kolaborasi real-time antar pengguna.
3. Domain pembelajaran di luar teknologi/programming.
4. Aplikasi mobile native (hanya responsive web).

TENTATIVE SCHEDULE
KEY MILESTONE | START | FINISH
Fase 1: Perencanaan & Desain (Requirement, wireframe, arsitektur) | 15/11/2025 | 15/12/2025
Fase 2: Pengembangan Core (Auth, roadmap generation, visual canvas) | 16/12/2025 | 28/02/2026
Fase 3: Fitur Lanjutan (Quiz, AI Tutor, gamifikasi, sharing) | 01/03/2026 | 30/04/2026
Fase 4: Testing, QA, & Deployment (E2E testing, bug fixing, deploy production) | 01/05/2026 | 12/06/2026


RESOURCES
Kategori
Detail
PROJECT TEAM
1. Ida Bagus Giri Krisnabhawa - Project Manager

2. Bagus Ardin Prayoga - Backend Developer

3. Aldi Rachmatdianto - UI/UX Designer

4. Nadif - Frontend Developer
SUPPORT RESOURCES
- OpenAI API untuk layanan AI (roadmap generation, quiz generation, AI tutor chat)
- Vercel untuk hosting frontend
- Railway/cloud provider untuk hosting backend dan database PostgreSQL
- GitHub untuk version control dan CI/CD
SPECIAL NEEDS
1. Akses API key OpenAI (GPT-4o-mini) untuk fitur AI (roadmap, quiz, chat).

2. Akses OAuth credentials Google dan GitHub untuk fitur login sosial.


COSTS
COST TYPE | VENDOR/LABOR NAMES | RATE | QTY | AMOUNT
Tenaga Kerja | Project Manager (Ida Bagus Giri Krisnabhawa) | Rp 0 (kontribusi akademis) | 1 | Rp 0
Tenaga Kerja | Backend Developer (Bagus Ardin Prayoga) | Rp 0 (kontribusi akademis) | 1 | Rp 0
Tenaga Kerja | UI/UX Designer (Aldi Rachmatdianto) | Rp 0 (kontribusi akademis) | 1 | Rp 0
Tenaga Kerja | Frontend Developer (Nadif) | Rp 0 (kontribusi akademis) | 1 | Rp 0
Layanan Cloud | Vercel (Frontend Hosting) | Rp 0 (free tier) | 1 | Rp 0
Layanan Cloud | Railway (Backend + PostgreSQL) | Rp 75.000/bulan | 7 bulan | Rp 525.000
API AI | OpenAI API (GPT-4o-mini) | Rp 300.000/bulan | 7 bulan | Rp 2.100.000
Domain | Domain .com | Rp 150.000/tahun | 1 | Rp 150.000
Lain-lain | Biaya tak terduga | - | - | Rp 500.000
TOTAL COSTS | | | | Rp 3.275.000


BENEFITS AND CUSTOMERS
PROCESS OWNER: Ida Bagus Giri Krisnabhawa - Project Manager
Kategori
Detail
KEY STAKEHOLDERS
1. Ida Bagus Giri Krisnabhawa - Project Manager & Product Owner
2. Tim Pengembang (Bagus Ardin, Aldi, Nadif) - Pelaksana teknis
3. Dosen Pembimbing/Sponsor - Pengarah akademis
FINAL CUSTOMER
1. Pemula yang ingin memasuki bidang software/IT dan butuh panduan belajar terstruktur.

2. Developer intermediate yang ingin berpindah ke stack baru (backend, data, mobile) dengan learning path yang jelas.
EXPECTED BENEFITS
1. Pengguna mendapatkan roadmap belajar yang personal dan terstruktur tanpa biaya, menghemat waktu riset mandiri hingga 70%.

2. Meningkatkan completion rate belajar mandiri melalui gamifikasi (XP, streak, badge) dan AI tutor yang kontekstual.

Rincian Manfaat (Estimasi)
TYPE OF BENEFIT | BASIS OF ESTIMATE | ESTIMATED BENEFIT AMOUNT
Specific Cost Savings | Pengguna menghemat biaya kursus online (rata-rata Rp 500.000/kursus x 3 kursus) | Rp 1.500.000/pengguna/tahun
Enhanced Revenues | Potensi langganan PRO (target 100 pengguna x Rp 50.000/bulan) dalam 1 tahun | Rp 60.000.000/tahun
Higher Productivity (Soft) | Efisiensi belajar meningkat ~50% karena roadmap terstruktur dan AI tutor | Peningkatan produktivitas belajar signifikan
Improved Compliance | Konten roadmap terbatas pada domain teknologi, menghindari konten berbahaya | Kepatuhan terhadap standar edukasi
Better Decision Making | Data analytics pengguna (completion rate, quiz score) membantu iterasi produk | Keputusan produk berbasis data
Less Maintenance | Arsitektur modular (React + Express + Prisma) memudahkan pemeliharaan | Pengurangan waktu maintenance ~30%
Other Costs Avoided | Mengurangi kebutuhan mentor/tutor manusia dengan AI Tutor otomatis | Rp 2.000.000/mentor/bulan
TOTAL BENEFIT | | Rp 63.500.000/tahun (estimasi)


RISKS, CONSTRAINTS, AND ASSUMPTIONS
Kategori
Detail
RISKS
1. Ketergantungan pada API OpenAI: jika terjadi downtime atau perubahan harga, fitur inti (roadmap, quiz, chat) akan terganggu.

2. Kualitas roadmap AI: hasil generasi AI mungkin tidak selalu akurat atau relevan, memerlukan iterasi prompt engineering.

3. Keterbatasan waktu tim: anggota tim memiliki komitmen akademis lain yang dapat memperlambat pengembangan.
CONSTRAINTS
1. Budget terbatas (proyek akademis), sehingga harus memaksimalkan free tier layanan cloud dan API.

2. Timeline pengembangan terikat kalender akademik (harus selesai sebelum 12 Juni 2026).
ASSUMPTIONS
1. Semua anggota tim memiliki ketersediaan minimal 10-15 jam/minggu untuk kontribusi pengembangan.

2. OpenAI API tetap tersedia dan harga tidak berubah signifikan selama masa pengembangan.


PERSETUJUAN DOKUMEN
PREPARED BY | TITLE | DATE
Ida Bagus Giri Krisnabhawa | Project Manager | 03/30/2026


.
