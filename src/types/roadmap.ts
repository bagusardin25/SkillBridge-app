import type { Node, Edge } from "@xyflow/react";

export type NodeCategory = "core" | "optional" | "advanced" | "project";

// Node data structure following RoadmapResponse interface
// Index signature required for React Flow compatibility
export interface RoadmapNodeData extends Record<string, unknown> {
    label: string;
    description: string;
    resources: string[];
    category?: NodeCategory;
    isCompleted?: boolean;
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
        };
    }[];
    edges: {
        id: string;
        source: string;
        target: string;
        edgeType?: "main" | "branch";
    }[];
}
