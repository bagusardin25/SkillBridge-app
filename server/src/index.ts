import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import roadmapRouter from "./routes/roadmap.js";
import chatRouter from "./routes/chat.js";
import projectRouter from "./routes/project.js";
import authRouter from "./routes/auth.js";
import quizRouter from "./routes/quiz.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { error: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/roadmap", roadmapRouter);
app.use("/api/chat", chatRouter);
app.use("/api/project", projectRouter);
app.use("/api/quiz", quizRouter);

// Health check
app.get("/api/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
