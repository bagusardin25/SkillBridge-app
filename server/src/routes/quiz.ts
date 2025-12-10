import { Router } from "express";
import { z } from "zod";
import OpenAI from "openai";
import { prisma } from "../lib/prisma.js";

const router = Router();

const PASSING_PERCENTAGE = 0.9; // 90% to pass

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const generateQuizSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  description: z.string().optional(),
});

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_PROMPT = `You are an expert quiz generator. Generate exactly 5 multiple choice questions to test understanding of the given topic.

RULES:
1. Each question must have exactly 4 options (A, B, C, D)
2. Only ONE option is correct
3. Questions should test understanding, not just memorization
4. Include a brief explanation for why the correct answer is right
5. Make questions progressively harder (easy to medium to hard)

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
- No markdown, just pure JSON`;

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

    const { topic, description } = validation.data;

    const userPrompt = description
      ? `Generate a quiz about "${topic}". Context: ${description}`
      : `Generate a quiz about "${topic}"`;

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
  userId: z.string().min(1),
  answers: z.array(z.number()),
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctIndex: z.number(),
    explanation: z.string(),
  })),
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

    const { roadmapId, nodeId, userId, answers, questions } = validation.data;

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

// GET /api/quiz/result/:roadmapId/:nodeId/:userId - Get quiz result for a node
router.get("/result/:roadmapId/:nodeId/:userId", async (req, res) => {
  try {
    const { roadmapId, nodeId, userId } = req.params;

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

export default router;
