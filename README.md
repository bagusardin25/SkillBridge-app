# 🌉 SkillBridge

> **AI-Powered Learning Roadmap Generator** - Build personalized learning paths with AI assistance

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## ✨ Features

- 🤖 **AI-Generated Roadmaps** - Just describe your goal, AI creates structured learning path
- 🗺️ **Visual Flowchart** - Interactive roadmap like roadmap.sh with branching paths
- 💬 **AI Tutor Chat** - Ask questions about any topic, get contextual explanations
- 📝 **Mini Quiz System** - Test your understanding, auto-mark topics as done
- 📊 **Progress Tracking** - XP, levels, streaks, and completion stats
- 🔐 **OAuth Login** - Sign in with Google or GitHub
- 🌙 **Dark Mode** - Easy on the eyes

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- OpenAI API Key

### Installation

```bash
# Clone repository
git clone <repo-url>
cd SkillBridge

# Install dependencies
npm install
cd server && npm install && cd ..

# Setup environment
cp server/.env.example server/.env
# Edit server/.env with your credentials

# Setup database
npm run db:push
npm run db:generate

# Run development server
npm run dev
```

Open http://localhost:5173 🎉

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS |
| UI Components | shadcn/ui, Radix UI |
| Flow Canvas | React Flow (xyflow) |
| State | Zustand |
| Backend | Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| AI | OpenAI GPT-4o-mini |
| Auth | JWT, OAuth 2.0 |

## 📁 Project Structure

```
SkillBridge/
├── src/                    # Frontend
│   ├── components/         # React components
│   ├── pages/              # Route pages
│   ├── store/              # Zustand stores
│   └── lib/                # API & utilities
│
├── server/                 # Backend
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # AI, OAuth, Email
│   │   └── middleware/     # Auth middleware
│   └── prisma/             # Database schema
│
└── README.md
```

## 🔑 Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# AI
OPENAI_API_KEY="sk-..."

# Auth
JWT_SECRET="your-secret"

# OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

## 📄 License

MIT License - feel free to use for your own projects!

---

Built with ❤️ for **Education & Upskilling**
