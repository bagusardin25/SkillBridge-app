import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// Set to true to use mock responses (useful when API quota is exceeded)
const USE_MOCK = process.env.USE_MOCK === "true";

export interface RoadmapResponse {
  title: string;
  nodes: {
    id: string;
    label: string;
    type: "input" | "default" | "output";
    category: "core" | "optional" | "advanced" | "project";
    data: {
      description: string;
      resources: string[];
    };
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    edgeType?: "main" | "branch";
  }[];
}

export const SYSTEM_PROMPT = `You are SkillBridge, an AI that creates structured BRANCHING learning roadmaps similar to roadmap.sh style.

Generate a roadmap with a MAIN PATH (core topics) and BRANCH NODES (optional/advanced topics) in this EXACT JSON format:
{
  "title": "Roadmap Title",
  "nodes": [
    {
      "id": "1",
      "label": "Topic Name",
      "type": "input|default|output",
      "category": "core|optional|advanced|project",
      "data": {
        "description": "What to learn and why",
        "resources": ["https://resource1.com", "https://resource2.com"]
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "edgeType": "main|branch" }
  ]
}

STRUCTURE RULES:
- Create a MAIN PATH with 6-8 "core" category nodes (vertical flow)
- Add 4-6 BRANCH NODES with "optional" or "advanced" category that connect from core nodes
- Branch nodes represent alternative paths, deeper dives, or optional skills

NODE TYPES:
- "input": Starting point (first node only)
- "default": Middle nodes
- "output": Goal/completion nodes

CATEGORIES:
- "core": Essential topics on the main learning path (REQUIRED)
- "optional": Nice-to-have topics, alternatives (branches left/right)
- "advanced": Deep-dive or advanced topics (branches)
- "project": Hands-on project suggestions (branches)

EDGE TYPES:
- "main": Connects core nodes in the main path
- "branch": Connects core nodes to optional/advanced branches

EXAMPLE STRUCTURE:
- Core: Basics → Fundamentals → Intermediate → Advanced → Goal
- Branches: Each core node can have 1-2 optional/advanced branches

IMPORTANT:
- Return ONLY valid JSON, no markdown
- Include real, verified learning resources
- Total 10-15 nodes maximum
- Ensure logical learning progression`;

export const CHAT_PROMPT = `You are SkillBridge, a helpful AI assistant for learning and skill development.
You help users with questions about their learning journey, provide explanations, and give advice.
Be concise, friendly, and helpful. Respond in the same language as the user's message.`;

export async function generateRoadmap(prompt: string): Promise<RoadmapResponse> {
  // Mock mode - throw error instead of returning fake data
  if (USE_MOCK) {
    throw new Error("Mock mode is enabled. Please set USE_MOCK=false in server/.env");
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Create a learning roadmap for: ${prompt}` },
      ],
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content || "";

    // Clean up response - remove markdown code blocks if present
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    return JSON.parse(cleanedText);
  } catch (error: any) {
    console.error("Generate roadmap error:", error.message);

    // Throw specific errors - NO fallback to mock data
    if (error.status === 429 || error.message?.includes("rate_limit")) {
      throw new Error("API rate limit exceeded. Please wait 1-2 minutes and try again.");
    }

    if (error.status === 400) {
      throw new Error("Invalid request. Please try a different prompt.");
    }

    if (error.status === 401) {
      throw new Error("API key is invalid. Please check your OpenAI API key.");
    }

    throw new Error(`Failed to generate roadmap: ${error.message}`);
  }
}



export async function chatWithAI(
  message: string,
  context?: { role: string; content: string }[]
): Promise<string> {
  // Mock mode - return error message
  if (USE_MOCK) {
    throw new Error("Mock mode is enabled. Please set USE_MOCK=false in server/.env");
  }

  try {
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: CHAT_PROMPT },
    ];

    // Add conversation history
    if (context) {
      for (const msg of context) {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        });
      }
    }

    // Add current user message
    messages.push({ role: "user", content: message });

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error: any) {
    console.error("AI Error:", error.message);

    // Throw specific errors
    if (error.status === 429 || error.message?.includes("rate_limit")) {
      throw new Error("API rate limit exceeded. Please wait 1-2 minutes and try again.");
    }

    if (error.status === 404) {
      throw new Error("Model not found. Please check the model configuration.");
    }

    throw new Error(`AI chat failed: ${error.message}`);
  }
}

