# SkillBridge Product Specification

Version: 1.0  
Last updated: March 9, 2026  
Product: SkillBridge

## 1. Product Overview
SkillBridge is an AI-powered web application that helps users build structured learning roadmaps for technology and programming topics. Users can generate roadmaps from natural language goals, follow progress through an interactive visual canvas, take quizzes per topic, chat with an AI tutor, and track growth with XP, levels, streaks, and badges.

## 2. Problem Statement
Self-learners often struggle with:
- Unclear learning sequence
- Overwhelming number of learning resources
- Lack of accountability and progress visibility
- No personalized guidance when stuck

SkillBridge solves this by combining AI roadmap generation, visual learning flow, contextual tutoring, and measurable progress tracking in one workspace.

## 3. Goals and Non-Goals
### Goals
- Generate practical, step-by-step learning roadmaps for tech topics.
- Provide an interactive learning workspace with node-level resources, notes, quiz, and AI tutor.
- Enable users to track momentum (completion, streaks, XP, level, badges).
- Support project persistence, sharing, and exports.

### Non-Goals (Current Version)
- Team collaboration in real-time.
- Full payment/subscription processing (billing is informational in beta).
- Non-technology learning domains.

## 4. Target Users
- Beginner learners entering software/IT fields.
- Intermediate developers pivoting to new stacks (e.g., backend, data, mobile).
- Self-directed learners preparing portfolios/interviews.
- Hobbyist technologists who want structured progression.

## 5. Core User Journeys
1. User signs up (email/password or OAuth Google/GitHub) and lands in `/app`.
2. User asks AI for a roadmap (e.g., "Learn Go backend from zero").
3. System creates/uses project, generates roadmap, renders it in flow canvas, and stores it.
4. User opens nodes to study resources, ask AI tutor, write notes, and complete quiz.
5. Progress updates visually and in profile stats; user earns XP and badges.
6. User saves/exports/shares roadmap and returns later to continue.

## 6. Functional Requirements
### 6.1 Authentication and Account
- Email/password registration and login.
- OAuth login: Google, GitHub.
- JWT-based session (`/auth/me` supported).
- Password reset and email verification endpoints available.
- Protected app routes require authenticated session.

### 6.2 Projects and Roadmaps
- Create, rename, delete projects.
- Persist one or more roadmaps per project.
- Generate roadmap via AI with preferences:
  - Skill level: beginner/intermediate/advanced
  - Time intensity: casual/moderate/intensive
  - Style: theory/practice/balanced
  - Goal: career/project/certification/hobby
- Save and auto-save roadmap edits.
- Fetch public roadmap by share link.
- Toggle roadmap visibility (`isPublic`).

### 6.3 Visual Roadmap Workspace
- React Flow canvas with custom nodes/edges.
- Node selection opens detail panel.
- Modes: select/pan; drag/drop and click-to-place nodes in edit mode.
- Undo/redo supported.
- Global progress indicator shown in canvas.
- Minimap, focus-current-step, and edge status visualization supported.

### 6.4 Node Detail Experience
- Tabs: Resources, AI Tutor, Notes.
- Resource cards with type tagging and open tracking.
- Notes are persisted per roadmap/node/user (auto-save + manual save).
- Prerequisite awareness: quiz/project actions can be locked until dependencies completed.
- Quiz result review and PDF export supported in node panel.

### 6.5 Quiz and Mastery
- Generate 5 multiple-choice questions/topic.
- 4 options/question, one correct answer.
- Pass threshold: 80%.
- 5-minute timer with timeout handling.
- Cached quiz support per roadmap/node/user.
- Quiz submission persisted; pass marks topic complete.
- Successful completion grants +100 XP.

### 6.6 AI Tutor and Chat
- Project-level and node-level chat.
- Chat history persisted.
- Markdown/code rendering in UI responses.
- Stop generation, regenerate last response, feedback markers (like/dislike), and copy actions.
- AI provider fallback supported (OpenAI primary, Gemini fallback in server service).

### 6.7 Progress, Profile, and Gamification
- Profile includes:
  - XP and level
  - Current/longest streak
  - Learning minutes
  - Quiz pass/take stats
  - Completed topics/roadmaps
- Streak update endpoint called on login session.
- Learning time tracked in-app and saved periodically.
- Badge system based on milestones (topics, roadmaps, streak, quizzes, XP, level).

### 6.8 Sharing, Export, and Certificate
- Export roadmap canvas to PNG.
- Share roadmap via public URL (`/share/:roadmapId`) in read-only mode.
- Certificate modal shown at 100% roadmap completion.
- Certificate can be downloaded as PDF.

### 6.9 Settings and Language
- Appearance: dark/light mode toggle.
- Editor preference: AI panel toggle.
- Language selector supports Indonesian/English preference storage.
- Notification and account deletion UI present; backend action is not fully implemented.

### 6.10 Billing (Beta Status)
- Plan comparison UI (FREE/PRO/ENTERPRISE).
- Beta notice explicitly states payment/upgrade flow is not active.
- All users effectively access pro-like experience during beta.

## 7. Domain and Content Rules
- Roadmap generation is restricted to technology/programming domains.
- Harmful/illegal requests are rejected in AI prompts.
- Cybersecurity content is constrained to defensive/ethical framing.

## 8. Data Model (High-Level)
- `User`: identity, auth, profile fields, tier, XP/level, streak, learning minutes.
- `Project`: user-owned container for roadmaps.
- `Roadmap`: title, nodes JSON, edges JSON, public/private state.
- `QuizResult`: per user-roadmap-node result (unique composite key).
- `ChatMessage`: project-scoped messages, optionally node-scoped.
- `NodeNote`: per user-roadmap-node note (upsert model).

## 9. Non-Functional Requirements
- Responsive UX for desktop and mobile.
- Auto-save behavior for roadmap editing.
- API error handling for quota/rate-limit and fallback messaging.
- Baseline auth route rate limiting in backend.
- Persistent local auth state in frontend store.

## 10. Success Metrics
- Activation: % of new users generating first roadmap.
- Engagement: weekly active learners, avg sessions/week.
- Learning activity: quizzes taken/pass rate, completed topics/roadmaps.
- Retention proxy: streak continuation rate (D7/D30).
- Product output quality: roadmap save rate, share/export usage.

## 11. Current Gaps and Next Priorities
- Enforce authorization consistently across non-auth APIs (currently many endpoints accept direct `userId`).
- Complete payment/subscription flow (plan upgrades, billing events).
- Implement real notification settings and account deletion backend.
- Add collaboration and multi-roadmap management UX improvements.
- Expand analytics instrumentation for funnel and cohort tracking.

## 12. Tech Stack Summary
- Frontend: React 19, TypeScript, Vite, Tailwind, Radix/shadcn, React Flow, Zustand.
- Backend: Express + TypeScript, Prisma ORM.
- Database: PostgreSQL.
- AI: OpenAI (primary) with Gemini fallback path.
- Auth: JWT + OAuth (Google/GitHub).


