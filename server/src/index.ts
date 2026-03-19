import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import roadmapRouter from "./routes/roadmap.js";
import chatRouter from "./routes/chat.js";
import projectRouter from "./routes/project.js";
import authRouter from "./routes/auth.js";
import quizRouter from "./routes/quiz.js";
import profileRouter from "./routes/profile.js";
import notesRouter from "./routes/notes.js";
import { authMiddleware } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for AI-consuming endpoints (roadmap generate, chat, quiz generate)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute per IP
  message: { error: "Too many AI requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));

// Routes — auth has its own limiter, no authMiddleware
app.use("/api/auth", authLimiter, authRouter);

// Public route — accessible without auth (for shared roadmaps)
app.use("/api/roadmap/public", roadmapRouter);

// Protected routes — all require valid JWT
app.use("/api/roadmap", authMiddleware, aiLimiter, roadmapRouter);
app.use("/api/chat", authMiddleware, aiLimiter, chatRouter);
app.use("/api/project", authMiddleware, projectRouter);
app.use("/api/quiz", authMiddleware, aiLimiter, quizRouter);
app.use("/api/profile", authMiddleware, profileRouter);
app.use("/api/notes", authMiddleware, notesRouter);

// Health check
app.get("/api/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
