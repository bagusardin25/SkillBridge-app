import "dotenv/config";
import express from "express";
import cors from "cors";
import roadmapRouter from "./routes/roadmap.js";
import chatRouter from "./routes/chat.js";
import projectRouter from "./routes/project.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/roadmap", roadmapRouter);
app.use("/api/chat", chatRouter);
app.use("/api/project", projectRouter);

// Health check
app.get("/api/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
