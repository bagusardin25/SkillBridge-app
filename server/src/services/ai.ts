// AI Service - To be implemented in Phase 2
// This file will contain OpenAI/Gemini integration

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

When given a learning goal, generate a roadmap in this EXACT JSON format:
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
- Order nodes from beginner to advanced`;

// Placeholder function - will be implemented in Phase 2
export async function generateRoadmap(prompt: string): Promise<RoadmapResponse> {
  // TODO: Implement OpenAI/Gemini call
  throw new Error("AI generation not implemented yet");
}

export async function chatWithAI(
  message: string,
  context?: { role: string; content: string }[]
): Promise<string> {
  // TODO: Implement OpenAI/Gemini call
  throw new Error("AI chat not implemented yet");
}
