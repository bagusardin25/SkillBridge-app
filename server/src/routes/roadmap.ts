import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { generateRoadmap, RoadmapPreferences } from "../services/ai.js";
import { enrichNodeResources } from "../services/resourceEnricher.js";

const router = Router();

// Background resource enrichment (fire-and-forget)
async function enrichAndUpdateRoadmap(roadmapId: string, nodes: any[]) {
  try {
    console.log(`🔄 Background enrichment started for roadmap ${roadmapId}`);
    const enrichedNodes = await enrichNodeResources(nodes);

    // Update the roadmap in DB with enriched resources
    await prisma.roadmap.update({
      where: { id: roadmapId },
      data: { nodes: enrichedNodes as any },
    });

    console.log(`✅ Background enrichment complete for roadmap ${roadmapId}`);
  } catch (error) {
    console.error(`❌ Background enrichment failed for roadmap ${roadmapId}:`, error);
  }
}

// POST /api/roadmap/generate - Generate roadmap from AI
router.post("/generate", async (req, res) => {
  try {
    const { prompt, projectId, preferences } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Validate preferences if provided
    const validPreferences: RoadmapPreferences | undefined = preferences
      ? {
        skillLevel: preferences.skillLevel || "beginner",
        learningTime: preferences.learningTime || "moderate",
        learningStyle: preferences.learningStyle || "balanced",
        goal: preferences.goal || "career",
      }
      : undefined;

    // Generate roadmap using AI with preferences
    const roadmapData = await generateRoadmap(prompt, validPreferences);

    // Check if response is a valid roadmap
    const isValidRoadmap = roadmapData.title &&
      roadmapData.nodes &&
      Array.isArray(roadmapData.nodes) &&
      roadmapData.nodes.length > 0;

    if (!isValidRoadmap) {
      // Return friendly chat response instead of error
      const defaultMessage = (roadmapData as any).error ||
        "Hmm, saya tidak bisa membuat roadmap dari request tersebut. 🤔\n\n" +
        "Coba dengan format seperti:\n" +
        "• \"Buat roadmap belajar React\"\n" +
        "• \"Saya ingin belajar Python dari nol\"\n" +
        "• \"Jalur belajar menjadi Backend Developer\"\n\n" +
        "Ada topik teknologi yang ingin dipelajari?";

      return res.status(200).json({
        type: "chat",
        message: defaultMessage
      });
    }

    // If projectId provided, save to database
    if (projectId) {
      const savedRoadmap = await prisma.roadmap.create({
        data: {
          title: roadmapData.title,
          projectId,
          nodes: roadmapData.nodes,
          edges: roadmapData.edges,
        },
      });

      // Return roadmap immediately to client
      res.json({ ...roadmapData, id: savedRoadmap.id });

      // Fire-and-forget: enrich resources in background
      enrichAndUpdateRoadmap(savedRoadmap.id, roadmapData.nodes);
      return;
    }

    res.json(roadmapData);
  } catch (error) {
    console.error("Error generating roadmap:", error);
    const message = error instanceof Error ? error.message : "Failed to generate roadmap";
    res.status(500).json({ error: message });
  }
});

// POST /api/roadmap - Create roadmap directly (without AI)
router.post("/", async (req, res) => {
  try {
    const { title, projectId, nodes, edges } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    const roadmap = await prisma.roadmap.create({
      data: {
        title: title || "My Roadmap",
        projectId,
        nodes: nodes || [],
        edges: edges || [],
      },
    });

    res.status(201).json(roadmap);
  } catch (error) {
    console.error("Error creating roadmap:", error);
    res.status(500).json({ error: "Failed to create roadmap" });
  }
});

// GET /api/roadmap/public/:id - Get public roadmap (no auth required)
// NOTE: This route MUST be defined BEFORE /:id to prevent 'public' being matched as an id
router.get("/public/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const roadmap = await prisma.roadmap.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            title: true,
            user: {
              select: { name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found" });
    }

    if (!roadmap.isPublic) {
      return res.status(403).json({ error: "This roadmap is private" });
    }

    res.json(roadmap);
  } catch (error) {
    console.error("Error fetching public roadmap:", error);
    res.status(500).json({ error: "Failed to fetch roadmap" });
  }
});

// GET /api/roadmap/:id - Get roadmap by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const roadmap = await prisma.roadmap.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found" });
    }

    res.json(roadmap);
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    res.status(500).json({ error: "Failed to fetch roadmap" });
  }
});

// PUT /api/roadmap/:id - Update roadmap
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, nodes, edges } = req.body;

    const roadmap = await prisma.roadmap.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(nodes && { nodes }),
        ...(edges && { edges }),
      },
    });

    res.json(roadmap);
  } catch (error) {
    console.error("Error updating roadmap:", error);
    res.status(500).json({ error: "Failed to update roadmap" });
  }
});

// DELETE /api/roadmap/:id - Delete roadmap
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.roadmap.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting roadmap:", error);
    res.status(500).json({ error: "Failed to delete roadmap" });
  }
});

// PATCH /api/roadmap/:id/public - Toggle public status
router.patch("/:id/public", async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublic } = req.body;

    const roadmap = await prisma.roadmap.update({
      where: { id },
      data: { isPublic: Boolean(isPublic) },
    });

    res.json({ isPublic: roadmap.isPublic });
  } catch (error) {
    console.error("Error updating roadmap public status:", error);
    res.status(500).json({ error: "Failed to update sharing settings" });
  }
});

export default router;

