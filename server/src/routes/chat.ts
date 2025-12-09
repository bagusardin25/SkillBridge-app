import { Router } from "express";
import { chatWithAI } from "../services/ai.js";

const router = Router();

// POST /api/chat - Chat with AI
router.post("/", async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const reply = await chatWithAI(message, context);
    res.json({ reply });
  } catch (error) {
    console.error("Error in chat:", error);
    const message = error instanceof Error ? error.message : "Failed to process chat";
    res.status(500).json({ error: message });
  }
});

export default router;
