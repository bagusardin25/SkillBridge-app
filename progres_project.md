# SkillBridge - Progress Project

> **Last Updated:** 9 Desember 2025 (OpenAI + Branching Roadmap)

---

## 📊 Overall Progress

```
[███████████████████░░░░░░] 75%
```

| Area | Progress |
|------|----------|
| Infrastructure & Auth | 100% ✅ |
| AI Integration | 100% ✅ |
| Roadmap CRUD | 100% ✅ |
| Advanced Auth | 0% ⚪ |

---

## ✅ SUDAH SELESAI

### 1. Backend Infrastructure
| Fitur | Status | Catatan |
|-------|--------|---------|
| Express + TypeScript setup | ✅ Done | `server/src/index.ts` |
| Prisma + PostgreSQL | ✅ Done | `server/prisma/schema.prisma` |
| Database schema (User, Project, Roadmap) | ✅ Done | Termasuk Role & Tier |
| Environment config | ✅ Done | `server/.env` |

### 2. Auth Feature (MVP)
| Fitur | Status | File |
|-------|--------|------|
| Register endpoint | ✅ Done | `server/src/routes/auth.ts` |
| Login endpoint | ✅ Done | `server/src/routes/auth.ts` |
| JWT Authentication | ✅ Done | 7 hari expiry |
| Auth Middleware | ✅ Done | `server/src/middleware/auth.ts` |
| Rate Limiting | ✅ Done | 10 req/15 min |
| Role enum (USER, ADMIN, MODERATOR) | ✅ Done | Di schema |
| Tier enum (FREE, PRO, ENTERPRISE) | ✅ Done | Di schema |

### 3. API Endpoints
| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/auth/register` | POST | ✅ Done |
| `/api/auth/login` | POST | ✅ Done |
| `/api/auth/me` | GET | ✅ Done |
| `/api/project` | POST | ✅ Done |
| `/api/project` | GET | ✅ Done |
| `/api/project/:id` | GET | ✅ Done |
| `/api/project/:id` | PUT | ✅ Done |
| `/api/project/:id` | DELETE | ✅ Done |

### 4. Frontend Auth
| Fitur | Status | File |
|-------|--------|------|
| Login Page | ✅ Done | `src/pages/LoginPage.tsx` |
| Register Page | ✅ Done | `src/pages/RegisterPage.tsx` |
| Auth Store (Zustand + persist) | ✅ Done | `src/store/useAuthStore.ts` |
| Protected Route | ✅ Done | `src/components/ProtectedRoute.tsx` |
| React Router setup | ✅ Done | `src/App.tsx` |
| Sidebar user info & logout | ✅ Done | `src/components/layout/Sidebar.tsx` |
| API service (auth functions) | ✅ Done | `src/lib/api.ts` |

---

## 🟡 SEBAGIAN SELESAI - Core Features

### 1. AI Integration ✅
| Fitur | Status | Deskripsi |
|-------|--------|-----------|
| AI Service (OpenAI) | ✅ Done | `server/src/services/ai.ts` - gpt-4o-mini |
| `/api/roadmap/generate` | ✅ Done | Generate roadmap dari prompt |
| `/api/chat` | ✅ Done | Chat follow-up dengan AI |
| ChatPanel → Real API | ✅ Done | Terintegrasi dengan canvas |
| Prompt Engineering | ✅ Done | System prompt untuk branching roadmap |
| Auto-layout (Dagre) | ✅ Done | `src/lib/layoutUtils.ts` |
| Branching Roadmap | ✅ Done | Struktur seperti roadmap.sh |
| Category-based Styling | ✅ Done | Core/Optional/Advanced/Project nodes |

### 2. Roadmap Persistence ✅
| Fitur | Status | Deskripsi |
|-------|--------|-----------|
| Save roadmap ke DB | ✅ Done | Via `/generate` dengan projectId |
| Load roadmap dari DB | ✅ Done | Sidebar loads `project.roadmaps[0]` |
| `POST /api/roadmap/generate` | ✅ Done | Generate & save roadmap |
| `GET /api/roadmap/:id` | ✅ Done | Get single roadmap |
| `PUT /api/roadmap/:id` | ✅ Done | Update roadmap |
| `DELETE /api/roadmap/:id` | ✅ Done | Delete roadmap |
| Auto-save | ✅ Done | FlowCanvas auto-save (2s debounce) |
| Track roadmapId | ✅ Done | `currentRoadmapId` di store |

---

## 🟡 BELUM SELESAI - Enhancements

### Auth Enhancements (dari auth.md)
| Fitur | Status | Target Version |
|-------|--------|----------------|
| Email Verification | ❌ Belum | V1.1 |
| Password Reset | ❌ Belum | V1.1 |
| Google OAuth | ❌ Belum | V1.2 |
| GitHub OAuth | ❌ Belum | V1.2 |
| Refresh Token | ❌ Belum | V2.0 |
| Remember Me | ❌ Belum | V2.0 |
| Device/Session Tracking | ❌ Belum | V3.0 |

### SaaS Features
| Fitur | Status | Target Version |
|-------|--------|----------------|
| Subscription/Payment | ❌ Belum | V2.1 |
| Tier Limitations | ❌ Belum | V2.1 |
| Admin Panel | ❌ Belum | V3.0 |

---

## 🎯 Roadmap Pengembangan

### MVP (Current Target) ✅ COMPLETE
- [x] Backend setup
- [x] Auth system
- [x] Project CRUD
- [x] **AI Roadmap Generation** ✅
- [x] **ChatPanel integration** ✅
- [x] **Roadmap save/load** ✅
- [x] **Branching Roadmap (roadmap.sh style)** ✅

### V1.1
- [ ] Email verification
- [ ] Password reset

### V1.2
- [ ] Google OAuth
- [ ] GitHub OAuth

### V2.0
- [ ] Refresh token
- [ ] Rate limiting improvements
- [ ] Performance optimization

### V2.1
- [ ] Subscription tiers
- [ ] Payment integration

### V3.0
- [ ] Admin panel
- [ ] Analytics
- [ ] Team features

---

## 📁 Project Structure

```
SkillBridge/
├── src/                          # Frontend
│   ├── components/
│   │   ├── canvas/              # Flow canvas
│   │   ├── layout/              # Sidebar, Header, etc
│   │   ├── nodes/               # Custom nodes
│   │   └── ui/                  # shadcn components
│   ├── pages/                   # Login, Register
│   ├── store/                   # Zustand stores
│   ├── lib/                     # API, utils
│   └── types/                   # TypeScript types
│
├── server/                       # Backend
│   ├── src/
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Auth middleware
│   │   ├── services/            # AI service (TODO)
│   │   └── lib/                 # Prisma client
│   └── prisma/                  # Schema & migrations
│
├── auth.md                       # Auth spec
├── integrasi_backend.md          # Backend spec
├── Konsep_aplikasi.md            # App concept
└── progres_project.md            # This file
```

---

## 🔧 Setup untuk Development

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- Git

### Quick Start
```bash
# 1. Clone & install
git clone <repo>
cd SkillBridge
npm install
cd server && npm install

# 2. Setup database
# Edit server/.env dengan DATABASE_URL
npm run db:push
npm run db:generate

# 3. Run
npm run dev          # Terminal 1: Frontend
cd server && npm run dev  # Terminal 2: Backend
```

---

## 📝 Notes

- Database sudah di-reset saat implementasi auth (tidak ada data lama)
- Dummy user ID sudah diganti dengan real user ID dari auth
- Token disimpan di localStorage (untuk development)
- **OPENAI_API_KEY** digunakan untuk AI (migrasi dari Gemini ke OpenAI gpt-4o-mini)
- Roadmap sekarang memiliki struktur branching seperti roadmap.sh:
  - **Core nodes**: Jalur utama (wajib) - di tengah
  - **Optional/Advanced/Project nodes**: Cabang di kiri/kanan
