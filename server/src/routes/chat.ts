import { Router } from "express";
import { chatWithAI } from "../services/ai.js";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/chat/:projectId - Get chat history for a project (general chat)
router.get("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    const messages = await prisma.chatMessage.findMany({
      where: { projectId, nodeId: null },
      orderBy: { createdAt: "asc" },
    });

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// GET /api/chat/:projectId/node/:nodeId - Get chat history for a specific node
router.get("/:projectId/node/:nodeId", async (req, res) => {
  try {
    const { projectId, nodeId } = req.params;

    const messages = await prisma.chatMessage.findMany({
      where: { projectId, nodeId },
      orderBy: { createdAt: "asc" },
    });

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching node chat history:", error);
    res.status(500).json({ error: "Failed to fetch node chat history" });
  }
});

// DELETE /api/chat/:projectId - Clear chat history for a project
router.delete("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    await prisma.chatMessage.deleteMany({
      where: { projectId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    res.status(500).json({ error: "Failed to clear chat history" });
  }
});

// POST /api/chat/save - Save a single message (without AI call)
router.post("/save", async (req, res) => {
  try {
    const { projectId, role, content, nodeId } = req.body;

    if (!projectId || !role || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await prisma.chatMessage.create({
      data: { projectId, role, content, nodeId: nodeId || null },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
});

// POST /api/chat - Chat with AI
router.post("/", async (req, res) => {
  try {
    const { message, context, projectId, nodeId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Save user message to database if projectId is provided
    if (projectId) {
      await prisma.chatMessage.create({
        data: {
          projectId,
          nodeId: nodeId || null,
          role: "user",
          content: message,
        },
      });
    }

    // Normalize context to proper format
    let normalizedContext: { role: string; content: string }[] | undefined;

    if (context) {
      if (Array.isArray(context)) {
        normalizedContext = context.filter(
          (item) =>
            item &&
            typeof item.role === "string" &&
            typeof item.content === "string"
        );
      } else if (typeof context === "string") {
        normalizedContext = [{ role: "system", content: context }];
      }
    }

    const reply = await chatWithAI(message, normalizedContext);

    // Save AI reply to database if projectId is provided
    if (projectId) {
      await prisma.chatMessage.create({
        data: {
          projectId,
          nodeId: nodeId || null,
          role: "assistant",
          content: reply,
        },
      });
    }

    res.json({ reply });
  } catch (error) {
    console.error("Error in chat:", error);
    const message = error instanceof Error ? error.message : "Failed to process chat";
    res.status(500).json({ error: message });
  }
});

export default router;
