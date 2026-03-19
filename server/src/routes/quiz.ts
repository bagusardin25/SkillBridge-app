import { Router } from "express";
import { z } from "zod";
import OpenAI from "openai";
import { prisma } from "../lib/prisma.js";

const router = Router();

const PASSING_PERCENTAGE = 0.8; // 80% to pass (4 of 5 questions)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const generateQuizSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  description: z.string().optional(),
  resources: z.array(z.string()).optional(), // Learning resource URLs/titles for context
  language: z.string().optional(), // Language code: "en" or "id"
});

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_PROMPT = `You are an expert quiz generator for a learning platform. Generate exactly 5 multiple choice questions to test understanding of the given topic.

RULES:
1. Each question must have exactly 4 options (A, B, C, D)
2. Only ONE option is correct
3. Questions should test deep understanding, not just memorization
4. Include a clear, educational explanation for why the correct answer is right
5. Make questions progressively harder (easy → medium → hard)
6. If learning resources are provided, base your questions on the concepts and topics covered by those resources
7. Questions should be practical and relevant to real-world usage
8. Avoid trivially obvious or trick questions

Return ONLY valid JSON in this EXACT format:
{
  "questions": [
    {
      "question": "The question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation why this is correct"
    }
  ]
}

IMPORTANT:
- correctIndex is 0-based (0=A, 1=B, 2=C, 3=D)
- Return exactly 5 questions
- No markdown, just pure JSON
- CRITICAL: If a language is specified, you MUST write ALL questions, ALL options, and ALL explanations entirely in that language. Do not mix languages.`;

// POST /api/quiz/generate
router.post("/generate", async (req, res) => {
  try {
    const validation = generateQuizSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors,
      });
    }

    const { topic, description, resources, language } = validation.data;

    // Build user prompt with resource context
    let userPrompt = `Generate a quiz about "${topic}".`;
    if (description) {
      userPrompt += ` Context: ${description}`;
    }
    if (resources && resources.length > 0) {
      userPrompt += `\n\nThe learner has been studying from these resources:\n${resources.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nPlease base your questions on the concepts, techniques, and knowledge that would be covered by these resources. Focus on practical understanding that someone who studied these materials should know.`;
    }

    // Add language instruction
    if (language === "id") {
      userPrompt += `\n\nIMPORTANT: Generate ALL questions, options, and explanations in Bahasa Indonesia.`;
    } else if (language === "en") {
      userPrompt += `\n\nIMPORTANT: Generate ALL questions, options, and explanations in English.`;
    }

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: QUIZ_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content || "";

    // Clean up response
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleanedText);

    // Validate response structure
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid quiz format from AI");
    }

    // Validate each question
    const questions: QuizQuestion[] = parsed.questions.map((q: any, index: number) => {
      if (!q.question || !q.options || q.correctIndex === undefined) {
        throw new Error(`Invalid question at index ${index}`);
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${index} must have exactly 4 options`);
      }
      if (q.correctIndex < 0 || q.correctIndex > 3) {
        throw new Error(`Invalid correctIndex at question ${index}`);
      }
      return {
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation || "No explanation provided",
      };
    });

    res.json({ questions });
  } catch (error: any) {
    console.error("Generate quiz error:", error.message);

    if (error.status === 429 || error.message?.includes("rate_limit")) {
      return res.status(429).json({
        error: "API rate limit exceeded. Please wait and try again.",
      });
    }

    res.status(500).json({
      error: error.message || "Failed to generate quiz",
    });
  }
});

// Schema for submit quiz
const submitQuizSchema = z.object({
  roadmapId: z.string().min(1),
  nodeId: z.string().min(1),
  answers: z.array(z.number()),
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctIndex: z.number(),
    explanation: z.string(),
  })),
  timeTaken: z.number().optional(),
});

// POST /api/quiz/submit - Submit quiz and save result
router.post("/submit", async (req, res) => {
  try {
    const validation = submitQuizSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors,
      });
    }

    const { roadmapId, nodeId, answers, questions, timeTaken } = validation.data;
    const userId = req.user!.id;

    // Calculate score
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    const scorePercentage = correctCount / totalQuestions;
    const passed = scorePercentage >= PASSING_PERCENTAGE;

    // Upsert quiz result (create or update)
    const result = await prisma.quizResult.upsert({
      where: {
        roadmapId_nodeId_userId: {
          roadmapId,
          nodeId,
          userId,
        },
      },
      update: {
        score: correctCount,
        totalQuestions,
        passed,
        answers,
        questions,
        timeTaken,
        updatedAt: new Date(),
      },
      create: {
        roadmapId,
        nodeId,
        userId,
        score: correctCount,
        totalQuestions,
        passed,
        answers,
        questions,
        timeTaken,
      },
    });

    res.json({
      id: result.id,
      score: correctCount,
      totalQuestions,
      percentage: Math.round(scorePercentage * 100),
      passed,
      message: passed
        ? "Congratulations! You passed the quiz!"
        : `You need ${Math.ceil(totalQuestions * PASSING_PERCENTAGE)} correct answers to pass.`,
    });
  } catch (error: any) {
    console.error("Submit quiz error:", error.message);
    res.status(500).json({
      error: error.message || "Failed to submit quiz",
    });
  }
});

// GET /api/quiz/result/:roadmapId/:nodeId - Get quiz result for a node
router.get("/result/:roadmapId/:nodeId", async (req, res) => {
  try {
    const { roadmapId, nodeId } = req.params;
    const userId = req.user!.id;

    const result = await prisma.quizResult.findUnique({
      where: {
        roadmapId_nodeId_userId: {
          roadmapId,
          nodeId,
          userId,
        },
      },
    });

    if (!result) {
      return res.status(404).json({ error: "Quiz result not found" });
    }

    res.json({
      id: result.id,
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: Math.round((result.score / result.totalQuestions) * 100),
      passed: result.passed,
      answers: result.answers,
      questions: result.questions,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  } catch (error: any) {
    console.error("Get quiz result error:", error.message);
    res.status(500).json({
      error: error.message || "Failed to get quiz result",
    });
  }
});

// GET /api/quiz/results/:roadmapId - Get all quiz results for a roadmap
router.get("/results/:roadmapId", async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user!.id;

    const results = await prisma.quizResult.findMany({
      where: { roadmapId, userId },
      select: {
        nodeId: true,
        passed: true,
        score: true,
        totalQuestions: true,
      },
    });

    res.json({ results });
  } catch (error: any) {
    console.error("Get quiz results error:", error.message);
    res.status(500).json({
      error: error.message || "Failed to get quiz results",
    });
  }
});

// GET /api/quiz/cached/:roadmapId/:nodeId - Get cached quiz questions if exists
router.get("/cached/:roadmapId/:nodeId", async (req, res) => {
  try {
    const { roadmapId, nodeId } = req.params;
    const userId = req.user!.id;

    const existingResult = await prisma.quizResult.findUnique({
      where: {
        roadmapId_nodeId_userId: {
          roadmapId,
          nodeId,
          userId,
        },
      },
      select: {
        questions: true,
      },
    });

    if (existingResult && existingResult.questions) {
      return res.json({
        questions: existingResult.questions,
        cached: true,
      });
    }

    return res.json({ cached: false });
  } catch (error: any) {
    console.error("Get cached quiz error:", error.message);
    res.status(500).json({
      error: error.message || "Failed to get cached quiz",
    });
  }
});

export default router;
