# 🌉 SkillBridge

> **AI-Powered Learning Roadmap Generator** — Describe your goal, and AI builds a personalized, interactive learning path complete with resources, quizzes, and an AI tutor.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## 📸 Screenshots

<p align="center">
  <img src="public/screenshots/app-roadmap.png" width="45%" alt="AI-Generated Roadmap" />
  <img src="public/screenshots/app-node-details.png" width="45%" alt="Node Details & Resources" />
</p>
<p align="center">
  <img src="public/screenshots/app-ai-tutor.png" width="45%" alt="AI Tutor Chat" />
  <img src="public/screenshots/app-quiz.png" width="45%" alt="Quiz System" />
</p>

---

## ✨ Features

### 🤖 AI-Powered Roadmap Generation
- Describe your learning goal in natural language
- AI generates a structured, multi-node learning path with branching topics
- Dual AI providers: **OpenAI GPT-4o-mini** (primary) with **Google Gemini** fallback
- Automatic retry with validation to ensure quality output

### 🗺️ Interactive Visual Flowchart
- Powered by **React Flow (xyflow)** — a node-based visual canvas
- Drag, zoom, pan, and reorganize your learning path
- Auto-layout with custom edge styles and node components
- Custom node types: topic nodes, milestone nodes

### 📚 Curated Learning Resources
- Auto-enriched nodes with **YouTube videos**, **Dev.to articles**, and **documentation links**
- In-memory caching for fast resource lookup
- YouTube Data API v3 integration for video thumbnails and metadata

### 💬 AI Tutor Chat
- Context-aware chat per node — click any topic to dive deeper
- Full-screen and side-panel chat modes
- Streaming responses (SSE) with markdown rendering and syntax highlighting
- Persistent chat history stored in database

### 📝 Quiz System
- AI-generated 5-question quizzes per topic
- Auto-grading with 90% pass threshold
- Full-screen distraction-free quiz mode with timer
- Passing a quiz auto-marks the node as completed

### 📊 Progress & Gamification
- **XP & Leveling** — earn XP for completing quizzes and activities
- **Daily Streaks** — consecutive day tracking with longest streak record
- **Learning Time** — automatic time tracking per session
- **Completion Stats** — visual progress bar per roadmap

### 🔐 Authentication & Security
- Email/password registration with email verification
- **OAuth 2.0** — Google and GitHub social login
- JWT-based session management with auto-refresh
- **Helmet.js** security headers
- **Rate limiting** on auth and AI endpoints
- Role-based access (USER, ADMIN, MODERATOR)

### 🌐 Internationalization
- Full **English** and **Bahasa Indonesia** support
- Language selection persisted across sessions

### 🎨 UI/UX
- **Dark/Light mode** with smooth transitions
- Responsive design (mobile, tablet, desktop)
- Animated landing page with scroll reveals, typewriter effects, and 3D tilt cards
- Toast notifications via Sonner
- Error boundary with graceful fallback UI
- Loading skeleton components

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Required |
|------|---------|----------|
| Node.js | v18+ | ✅ |
| PostgreSQL | v14+ | ✅ |
| OpenAI API Key | — | ✅ |
| Google Gemini API Key | — | Optional (fallback) |
| YouTube Data API Key | — | Optional (for video resources) |

### Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/SkillBridge.git
cd SkillBridge

# 2. Install all dependencies
npm install
cd server && npm install && cd ..

# 3. Setup environment variables
cp server/.env.example server/.env
# Edit server/.env with your credentials (see section below)

# 4. Setup database
npm run db:push       # Push schema to database
npm run db:generate   # Generate Prisma client

# 5. Start development server (frontend + backend concurrently)
npm run dev
```

Open **http://localhost:5173** 🎉

> The frontend runs on port **5173** (Vite) and the backend API on port **3001** (Express).

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** + TypeScript | UI framework |
| **Vite** | Build tool & dev server |
| **TailwindCSS** | Utility-first styling |
| **shadcn/ui** + Radix UI | Accessible component library |
| **React Flow (xyflow)** | Interactive node-based flowchart canvas |
| **Zustand** | Lightweight state management |
| **React Markdown** + Prism.js | Markdown rendering with syntax highlighting |
| **Sonner** | Toast notifications |
| **Lucide React** | Icon library |

### Backend

| Technology | Purpose |
|---|---|
| **Express** + TypeScript | REST API server |
| **Prisma ORM** | Type-safe database access |
| **PostgreSQL** | Relational database |
| **OpenAI SDK** | GPT-4o-mini for roadmap/quiz/chat generation |
| **Google Generative AI** | Gemini fallback provider |
| **JWT** (jsonwebtoken) | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Helmet** | HTTP security headers |
| **express-rate-limit** | API rate limiting |
| **Pino** + pino-pretty | Structured JSON logging |
| **Nodemailer** | Email verification & password reset |
| **Zod** | Runtime validation for AI output |
| **Vitest** | Unit testing framework |

### Infrastructure

| Technology | Purpose |
|---|---|
| **Railway** | Backend hosting & PostgreSQL |
| **Vercel** | Frontend hosting |
| **GitHub Actions** | CI pipeline (type check + tests) |

---

## 📁 Project Structure

```
SkillBridge/
├── public/
│   └── screenshots/                # App screenshots for README
│
├── src/                            # ── Frontend (React + Vite) ──
│   ├── components/
│   │   ├── canvas/                 # FlowCanvas, node interaction
│   │   ├── chat/                   # ChatPanel, MarkdownRenderer
│   │   ├── edges/                  # Custom React Flow edge types
│   │   ├── landing/                # Landing page sub-components
│   │   ├── layout/                 # AppLayout, Sidebar, Header
│   │   ├── nodes/                  # Custom React Flow node types
│   │   ├── quiz/                   # QuizFullScreen, QuizPanel
│   │   ├── roadmap/                # RoadmapSettings, ShareDialog
│   │   ├── ui/                     # Button, Input, Skeleton, Logo...
│   │   ├── ErrorBoundary.tsx       # Global error fallback UI
│   │   └── ProtectedRoute.tsx      # Auth guard wrapper
│   │
│   ├── contexts/                   # React contexts (Language)
│   ├── hooks/                      # Custom hooks (useLearningTimeTracker)
│   ├── lib/
│   │   ├── api.ts                  # REST API client (authFetch, CRUD)
│   │   ├── translations.ts         # i18n translation loader
│   │   ├── appTranslations.ts      # EN/ID translation strings
│   │   └── utils.ts                # Utility functions
│   │
│   ├── pages/                      # Route-level page components
│   │   ├── LandingPage.tsx         # Public marketing page
│   │   ├── LoginPage.tsx           # Email + OAuth login
│   │   ├── RegisterPage.tsx        # Registration with confirm password
│   │   ├── ProfilePage.tsx         # User profile, stats, streaks
│   │   ├── SettingsPage.tsx        # Account settings
│   │   ├── SharePage.tsx           # Public shared roadmap view
│   │   └── ...                     # ForgotPassword, ResetPassword, etc.
│   │
│   └── store/                      # Zustand stores
│       ├── useAuthStore.ts         # Auth state (user, token)
│       └── useRoadmapStore.ts      # Roadmap, theme, UI state
│
├── server/                         # ── Backend (Express + Prisma) ──
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema (6 models)
│   │   └── seed.ts                 # Database seeder
│   │
│   └── src/
│       ├── routes/
│       │   ├── auth.ts             # Login, register, OAuth, verify, reset
│       │   ├── chat.ts             # AI chat (streaming SSE + non-streaming)
│       │   ├── roadmap.ts          # Generate, save, load, share roadmaps
│       │   ├── project.ts          # CRUD project management
│       │   ├── quiz.ts             # Generate quizzes, submit answers
│       │   ├── profile.ts          # User stats, streaks, XP, avatar
│       │   └── notes.ts            # Per-node note CRUD
│       │
│       ├── services/
│       │   ├── ai.ts               # OpenAI + Gemini abstraction layer
│       │   ├── oauth.ts            # Google & GitHub OAuth handlers
│       │   ├── email.ts            # Nodemailer templates
│       │   └── resourceEnricher.ts # YouTube + Dev.to resource fetcher
│       │
│       ├── middleware/
│       │   └── auth.ts             # JWT verification middleware
│       │
│       ├── lib/
│       │   ├── prisma.ts           # Prisma client singleton
│       │   ├── logger.ts           # Pino structured logger
│       │   └── businessLogic.ts    # Pure functions (streak, XP, quiz scoring)
│       │
│       └── __tests__/
│           ├── auth.test.ts        # Auth middleware tests (6 tests)
│           └── businessLogic.test.ts # Streak, XP, quiz scoring (19 tests)
│
├── .github/workflows/
│   └── ci.yml                      # GitHub Actions CI pipeline
│
└── README.md
```

---

## 🔑 Environment Variables

Create `server/.env` with the following:

```env
# ── Database ────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/skillbridge"

# ── AI Providers ────────────────────────────────
OPENAI_API_KEY="sk-..."                    # Required — GPT-4o-mini
GEMINI_API_KEY="AIza..."                   # Optional — Gemini fallback

# ── Authentication ──────────────────────────────
JWT_SECRET="your-random-secret-string"     # Required — JWT signing key

# ── OAuth (optional) ────────────────────────────
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# ── Frontend URL (for OAuth callback) ───────────
FRONTEND_URL="http://localhost:5173"

# ── Email (optional — for verification) ─────────
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# ── YouTube (optional — for video resources) ────
YOUTUBE_API_KEY="AIza..."
```

---

## 📦 Available Scripts

### Root (frontend + full stack)

| Command | Description |
|---|---|
| `npm run dev` | Start both frontend (Vite) and backend (Express) concurrently |
| `npm run dev:frontend` | Start Vite dev server only |
| `npm run dev:backend` | Start Express dev server only |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |

### Server

| Command | Description |
|---|---|
| `npm run dev` | Start backend with hot-reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled server (`node dist/index.js`) |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

---

## 🧪 Testing

### Unit Tests (Vitest)

```bash
cd server
npm test
```

**25 tests** across 2 test suites:

| Suite | Tests | Covers |
|---|---|---|
| `auth.test.ts` | 6 | JWT middleware (missing token, invalid token, expired token, user not found, valid flow) |
| `businessLogic.test.ts` | 19 | Streak calculation, XP/Level math, quiz scoring/pass threshold |

### CI Pipeline (GitHub Actions)

Runs automatically on every push to `main` and on pull requests:
1. Frontend TypeScript type check
2. Backend TypeScript type check
3. Prisma client generation
4. Unit test execution

---

## 🗄️ Database Schema

The app uses **6 Prisma models**:

```
User ──────── 1:N ──── Project ──── 1:N ──── Roadmap
                                                │
                                     QuizResult ─┘
                                     ChatMessage ─┘
                                     NodeNote ────┘
```

| Model | Purpose |
|---|---|
| **User** | Auth, profile, XP/level, streaks, OAuth fields |
| **Project** | Groups roadmaps under a named project |
| **Roadmap** | React Flow nodes/edges stored as JSON, shareable |
| **QuizResult** | Quiz answers, score, pass/fail per node per user |
| **ChatMessage** | Chat history per project or per node |
| **NodeNote** | User notes attached to specific roadmap nodes |

---

## 🚢 Deployment

### Backend (Railway)

1. Connect your GitHub repo to Railway
2. Set the root directory to `server`
3. Railway auto-detects the `Dockerfile` or uses Nixpacks
4. Add all environment variables in Railway dashboard
5. Railway provides a PostgreSQL add-on for the database

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Set `VITE_API_URL` to your Railway backend URL (e.g. `https://your-app.up.railway.app/api`)
3. Deploy — Vercel auto-detects Vite

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use for your own projects!

---

<p align="center">
  Built with ❤️ for <strong>Education & Upskilling</strong>
</p>
