import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// POST /api/project - Create new project
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user!.id;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const project = await prisma.project.create({
      data: {
        title,
        userId,
      },
      include: {
        roadmaps: true,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// GET /api/project - Get all projects (optionally filter by userId)
router.get("/", async (req, res) => {
  try {
    const userId = req.user!.id;

    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        roadmaps: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// GET /api/project/:id - Get project by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        roadmaps: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Verify ownership
    if (project.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// PUT /api/project/:id - Update project (ownership verified via project lookup)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify ownership before updating
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    const { title } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title }),
      },
      include: {
        roadmaps: true,
      },
    });

    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// DELETE /api/project/:id - Delete project
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify ownership before deleting
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await prisma.project.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
