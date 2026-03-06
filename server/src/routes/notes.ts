import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const router = Router();
const prisma = new PrismaClient();

// Validation schema
const noteSchema = z.object({
    content: z.string().max(10000, "Note too long (max 10000 chars)"),
});

// GET note for a specific node
router.get("/:roadmapId/:nodeId/:userId", async (req, res) => {
    try {
        const { roadmapId, nodeId, userId } = req.params;

        const note = await prisma.nodeNote.findUnique({
            where: {
                roadmapId_nodeId_userId: { roadmapId, nodeId, userId },
            },
        });

        res.json({ note: note?.content || "", updatedAt: note?.updatedAt || null });
    } catch (error) {
        console.error("Error fetching note:", error);
        res.status(500).json({ error: "Failed to fetch note" });
    }
});

// PUT (upsert) note for a specific node
router.put("/:roadmapId/:nodeId/:userId", async (req, res) => {
    try {
        const { roadmapId, nodeId, userId } = req.params;

        const validation = noteSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors[0].message });
        }

        const { content } = validation.data;

        const note = await prisma.nodeNote.upsert({
            where: {
                roadmapId_nodeId_userId: { roadmapId, nodeId, userId },
            },
            update: { content },
            create: { roadmapId, nodeId, userId, content },
        });

        res.json({ note: note.content, updatedAt: note.updatedAt });
    } catch (error) {
        console.error("Error saving note:", error);
        res.status(500).json({ error: "Failed to save note" });
    }
});

export default router;
