import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Set to true to use mock responses (useful when API quota is exceeded)
const USE_MOCK = process.env.USE_MOCK === "true";

export interface RoadmapResponse {
  title: string;
  nodes: {
    id: string;
    label: string;
    type: "input" | "default" | "output";
    data: {
      description: string;
      resources: string[];
    };
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
  }[];
}

export const SYSTEM_PROMPT = `You are SkillBridge, an AI that creates structured learning roadmaps.

When given a learning goal, generate a roadmap in this EXACT JSON format (no markdown, pure JSON only):
{
  "title": "Roadmap Title",
  "nodes": [
    {
      "id": "1",
      "label": "Step Name",
      "type": "input|default|output",
      "data": {
        "description": "What to learn and why",
        "resources": ["https://resource1.com", "https://resource2.com"]
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}

Rules:
- First node should be type "input" (starting point)
- Last node(s) should be type "output" (goal achieved)
- Middle nodes are type "default"
- Maximum 10-15 nodes for clarity
- Include real, verified learning resources
- Order nodes from beginner to advanced
- IMPORTANT: Return ONLY valid JSON, no markdown code blocks`;

export const CHAT_PROMPT = `You are SkillBridge, a helpful AI assistant for learning and skill development.
You help users with questions about their learning journey, provide explanations, and give advice.
Be concise, friendly, and helpful. Respond in the same language as the user's message.`;

export async function generateRoadmap(prompt: string): Promise<RoadmapResponse> {
  const result = await model.generateContent([
    SYSTEM_PROMPT,
    `Create a learning roadmap for: ${prompt}`,
  ]);

  const text = result.response.text();

  // Clean up response - remove markdown code blocks if present
  const cleanedText = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  return JSON.parse(cleanedText);
}

export async function chatWithAI(
  message: string,
  context?: { role: string; content: string }[]
): Promise<string> {
  // Mock mode for development when API quota is exceeded
  if (USE_MOCK) {
    console.log("[MOCK MODE] Returning mock response");
    return getMockResponse(message);
  }

  try {
    const chatHistory = context
      ?.map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n") || "";

    const fullPrompt = chatHistory
      ? `${CHAT_PROMPT}\n\nPrevious conversation:\n${chatHistory}\n\nUser: ${message}`
      : `${CHAT_PROMPT}\n\nUser: ${message}`;

    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error: any) {
    console.error("AI Error:", error.message);

    // If API fails, return helpful error with fallback
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      return "⚠️ API quota exceeded. The Gemini API free tier limit has been reached. Please wait a minute or enable mock mode by setting USE_MOCK=true in your .env file.";
    }

    if (error.message?.includes("404")) {
      return "⚠️ Model not found. Please check the model name in ai.ts";
    }

    // Return mock response as fallback
    console.log("[FALLBACK] API failed, returning mock response");
    return getMockResponse(message);
  }
}

// Mock responses for development
function getMockResponse(message: string): string {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("roadmap") || lowerMsg.includes("learn")) {
    return "🎯 Great choice! To create a learning roadmap, I would typically:\n\n1. **Identify your current skill level**\n2. **Break down the topic into core concepts**\n3. **Create a structured learning path**\n4. **Recommend resources for each step**\n\n*Note: This is a mock response. Connect your Gemini API key with sufficient quota to get real AI-generated roadmaps!*";
  }

  if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("halo")) {
    return "👋 Hello! I'm SkillBridge AI Assistant. I can help you create learning roadmaps and answer questions about skill development.\n\n*Note: This is a mock response - the real AI is not connected yet.*";
  }

  return `📝 I received your message: "${message}"\n\nThis is a **mock response** for development purposes. To get real AI responses:\n\n1. Make sure your Gemini API key is valid\n2. Check that you haven't exceeded the free tier quota\n3. Wait a minute if you're rate limited\n\nThe app UI and backend are working correctly! 🎉`;
}

