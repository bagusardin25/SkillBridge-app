import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { generateRoadmap } from "../services/ai.js";

const router = Router();

// POST /api/roadmap/generate - Generate roadmap from AI
router.post("/generate", async (req, res) => {
  try {
    const { prompt, projectId } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Generate roadmap using AI
    const roadmapData = await generateRoadmap(prompt);

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
      return res.json({ ...roadmapData, id: savedRoadmap.id });
    }

    res.json(roadmapData);
  } catch (error) {
    console.error("Error generating roadmap:", error);
    res.status(500).json({ error: "Failed to generate roadmap" });
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

export default router;
