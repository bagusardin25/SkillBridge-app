import { Router } from "express";
import { chatWithAI, chatWithAIStream } from "../services/ai.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

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

// DELETE /api/chat/:projectId/node/:nodeId - Clear chat history for a specific node
router.delete("/:projectId/node/:nodeId", async (req, res) => {
  try {
    const { projectId, nodeId } = req.params;

    await prisma.chatMessage.deleteMany({
      where: { projectId, nodeId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error clearing node chat history:", error);
    res.status(500).json({ error: "Failed to clear node chat history" });
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

// POST /api/chat/stream - Stream chat with AI via SSE
router.post("/stream", async (req, res) => {
  const { message, context, projectId, nodeId, language } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
  res.flushHeaders();

  let clientDisconnected = false;
  req.on("close", () => {
    clientDisconnected = true;
  });

  // Save user message to DB
  if (projectId) {
    try {
      await prisma.chatMessage.create({
        data: { projectId, nodeId: nodeId || null, role: "user", content: message },
      });
    } catch (e) {
      console.error("Failed to save user message:", e);
    }
  }

  // Normalize context
  let normalizedContext: { role: string; content: string }[] | undefined;
  if (context) {
    if (Array.isArray(context)) {
      normalizedContext = context.filter(
        (item) => item && typeof item.role === "string" && typeof item.content === "string"
      );
    } else if (typeof context === "string") {
      normalizedContext = [{ role: "system", content: context }];
    }
  }

  let fullReply = "";

  try {
    const stream = chatWithAIStream(message, normalizedContext, language);

    for await (const token of stream) {
      if (clientDisconnected) break;

      fullReply += token;
      res.write(`data: ${JSON.stringify({ content: token })}\n\n`);
    }

    // Send done signal
    if (!clientDisconnected) {
      res.write("data: [DONE]\n\n");
    }

    // Save complete AI reply to DB
    if (projectId && fullReply) {
      try {
        await prisma.chatMessage.create({
          data: { projectId, nodeId: nodeId || null, role: "assistant", content: fullReply },
        });
      } catch (e) {
        console.error("Failed to save AI reply:", e);
      }
    }
  } catch (error) {
    console.error("Streaming error:", error);

    let errorMessage = "Terjadi kesalahan saat memproses permintaan";
    if (error instanceof Error) {
      if (error.message.includes("rate limit") || error.message.includes("429")) {
        errorMessage = "Server sedang sibuk. Silakan coba lagi dalam beberapa detik.";
      } else if (error.message.includes("unavailable")) {
        errorMessage = "Layanan AI sedang tidak tersedia. Silakan coba lagi nanti.";
      } else {
        errorMessage = error.message;
      }
    }

    if (!clientDisconnected) {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.write("data: [DONE]\n\n");
    }
  } finally {
    if (!clientDisconnected) {
      res.end();
    }
  }
});

// POST /api/chat - Chat with AI (non-streaming, kept for backward compatibility)
router.post("/", async (req, res) => {
  try {
    const { message, context, projectId, nodeId, language } = req.body;

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

    const reply = await chatWithAI(message, normalizedContext, language);

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
    
    let message = "Terjadi kesalahan saat memproses permintaan";
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes("rate limit") || error.message.includes("429") || error.message.includes("Rate limit")) {
        message = "Server sedang sibuk. Silakan coba lagi dalam beberapa detik.";
        statusCode = 429;
      } else if (error.message.includes("unavailable")) {
        message = "Layanan AI sedang tidak tersedia. Silakan coba lagi nanti.";
        statusCode = 503;
      } else if (error.message.includes("API key")) {
        message = "Konfigurasi server bermasalah. Silakan hubungi administrator.";
        statusCode = 500;
      } else {
        message = error.message;
      }
    }
    
    res.status(statusCode).json({ error: message });
  }
});

export default router;
