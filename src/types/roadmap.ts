import type { Node, Edge } from "@xyflow/react";

export type NodeCategory = "core" | "optional" | "advanced" | "project";
export type NodeStatus = "pending" | "done" | "in-progress" | "skipped";

// Quiz types
export interface QuizQuestion {
    question: string;
    options: string[];      // 4 pilihan ganda
    correctIndex: number;   // 0-3
    explanation: string;    // penjelasan jawaban
}

// Node data structure following RoadmapResponse interface
// Index signature required for React Flow compatibility
export interface RoadmapNodeData extends Record<string, unknown> {
    label: string;
    description: string;
    resources: string[];
    videos?: string[]; // Video tutorial URLs (YouTube, etc.)
    category?: NodeCategory;
    isCompleted?: boolean;
    status?: NodeStatus;
    quizPassed?: boolean;
    visitedResources?: string[]; // Array of visited resource URLs
    stepNumber?: number; // Urutan langkah (1, 2, 3, dst)
    isStartNode?: boolean; // Node pertama tanpa incoming edge
}

export type RoadmapNode = Node<RoadmapNodeData>;
export type RoadmapEdge = Edge;

// The protocol for AI-generated roadmaps
export interface RoadmapResponse {
    title: string;
    nodes: {
        id: string;
        label: string;
        type: "default" | "input" | "output";
        category?: NodeCategory;
        data: {
            description: string;
            resources: string[];
            videos?: string[];
        };
    }[];
    edges: {
        id: string;
        source: string;
        target: string;
        edgeType?: "main" | "branch";
    }[];
}
