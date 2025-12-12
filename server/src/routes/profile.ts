import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/profile/:userId - Get user profile with stats
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        bio: true,
        location: true,
        jobRole: true,
        xp: true,
        level: true,
        avatarUrl: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
        totalLearningMinutes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get projects with roadmaps and quiz stats
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        roadmaps: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    // Get quiz results for this user
    const quizResults = await prisma.quizResult.findMany({
      where: { userId },
    });

    // Calculate stats for each project
    const projectsWithStats = projects.map((project) => {
      const projectRoadmaps = project.roadmaps.map((roadmap) => {
        const nodes = (roadmap.nodes as any[]) || [];
        const totalNodes = nodes.length;
        
        // Count completed from node data (isCompleted or quizPassed flags saved in JSON)
        const completedFromNodeData = nodes.filter(
          (n) => n.data?.isCompleted === true || n.data?.quizPassed === true
        ).length;
        
        // Count completed from quiz results table
        const completedFromQuiz = quizResults.filter(
          (qr) => qr.roadmapId === roadmap.id && qr.passed
        ).length;
        
        // Use the higher count to ensure consistency
        const completedNodes = Math.max(completedFromNodeData, completedFromQuiz);

        const progress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

        return {
          id: roadmap.id,
          title: roadmap.title,
          totalNodes,
          completedNodes,
          progress,
        };
      });

      // Overall project progress
      const totalNodes = projectRoadmaps.reduce((acc, r) => acc + r.totalNodes, 0);
      const completedNodes = projectRoadmaps.reduce((acc, r) => acc + r.completedNodes, 0);
      const overallProgress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

      return {
        id: project.id,
        title: project.title,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        roadmaps: projectRoadmaps,
        totalNodes,
        completedNodes,
        overallProgress,
      };
    });

    // Calculate total stats
    const totalQuizzesPassed = quizResults.filter((qr) => qr.passed).length;
    const totalQuizzesTaken = quizResults.length;
    
    // Calculate total completed topics and roadmaps
    const totalCompletedTopics = projectsWithStats.reduce((acc, p) => acc + p.completedNodes, 0);
    const totalCompletedRoadmaps = projectsWithStats.reduce((acc, p) => {
      return acc + p.roadmaps.filter((r: { progress: number }) => r.progress === 100).length;
    }, 0);

    res.json({
      user,
      projects: projectsWithStats,
      stats: {
        totalProjects: projects.length,
        totalRoadmaps: projects.reduce((acc, p) => acc + p.roadmaps.length, 0),
        totalQuizzesPassed,
        totalQuizzesTaken,
        totalCompletedTopics,
        totalCompletedRoadmaps,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT /api/profile/:userId - Update user profile
router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, bio, location, jobRole, avatarUrl } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(jobRole !== undefined && { jobRole }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        bio: true,
        location: true,
        jobRole: true,
        xp: true,
        level: true,
        avatarUrl: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
        totalLearningMinutes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// POST /api/profile/:userId/update-streak - Update user streak
router.post("/:userId/update-streak", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = user.currentStreak;
    let newLongestStreak = user.longestStreak;

    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day, no change
      } else if (diffDays === 1) {
        // Consecutive day, increment streak
        newStreak = user.currentStreak + 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }
    } else {
      // First activity
      newStreak = 1;
    }

    // Update longest streak if current is higher
    if (newStreak > newLongestStreak) {
      newLongestStreak = newStreak;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: new Date(),
      },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating streak:", error);
    res.status(500).json({ error: "Failed to update streak" });
  }
});

// POST /api/profile/:userId/add-learning-time - Add learning minutes
router.post("/:userId/add-learning-time", async (req, res) => {
  try {
    const { userId } = req.params;
    const { minutes } = req.body;

    if (!minutes || typeof minutes !== "number") {
      return res.status(400).json({ error: "Minutes is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        totalLearningMinutes: user.totalLearningMinutes + minutes,
      },
      select: {
        totalLearningMinutes: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error adding learning time:", error);
    res.status(500).json({ error: "Failed to add learning time" });
  }
});

// POST /api/profile/:userId/add-xp - Add XP to user
router.post("/:userId/add-xp", async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ error: "Amount is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newXp = user.xp + amount;
    // Level up every 500 XP
    const newLevel = Math.floor(newXp / 500) + 1;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
      },
      select: {
        id: true,
        xp: true,
        level: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error adding XP:", error);
    res.status(500).json({ error: "Failed to add XP" });
  }
});

export default router;
