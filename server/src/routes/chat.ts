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

    // Normalize context to proper format
    let normalizedContext: { role: string; content: string }[] | undefined;

    if (context) {
      if (Array.isArray(context)) {
        // Validate each item has role and content as strings
        normalizedContext = context.filter(
          (item) =>
            item &&
            typeof item.role === "string" &&
            typeof item.content === "string"
        );
      } else if (typeof context === "string") {
        // If context is a string, treat it as system context
        normalizedContext = [{ role: "system", content: context }];
      }
      // If context is neither array nor string, ignore it (undefined)
    }

    const reply = await chatWithAI(message, normalizedContext);
    res.json({ reply });
  } catch (error) {
    console.error("Error in chat:", error);
    const message = error instanceof Error ? error.message : "Failed to process chat";
    res.status(500).json({ error: message });
  }
});

export default router;
