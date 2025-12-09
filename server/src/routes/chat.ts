import { Router } from "express";

const router = Router();

// POST /api/chat - Chat with AI
router.post("/", async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // TODO: Implement AI chat in Phase 2
    // For now, return a placeholder response
    res.json({
      reply: "AI chat will be implemented in Phase 2. Your message: " + message,
      context,
    });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

export default router;
