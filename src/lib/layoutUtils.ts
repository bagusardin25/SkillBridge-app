import dagre from 'dagre';
import type { RoadmapNode, RoadmapEdge } from "@/types/roadmap";
import type { GeneratedRoadmap, RoadmapNode as ApiNode } from "@/lib/api";
import { Position } from '@xyflow/react';

const NODE_WIDTH = 320;
const NODE_HEIGHT = 120;
const V_GAP = 80;   // vertical gap between nodes
const H_GAP = 60;   // horizontal gap between nodes

// Simple sequential step numbering for linear roadmap
function calculateStepNumbers(
  nodes: ApiNode[]
): Map<string, { stepNumber: number; isStartNode: boolean }> {
  const result = new Map<string, { stepNumber: number; isStartNode: boolean }>();
  nodes.forEach((node, index) => {
    result.set(node.id, { stepNumber: index + 1, isStartNode: index === 0 });
  });
  return result;
}

export function convertToReactFlowNodes(
  roadmap: GeneratedRoadmap
): { nodes: RoadmapNode[]; edges: RoadmapEdge[] } {
  const stepNumbers = calculateStepNumbers(roadmap.nodes);

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  // Using Top-to-Bottom (TB) orientation for a vertical skill tree feel
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: V_GAP, nodesep: H_GAP });

  // Map nodes into dagre graph
  roadmap.nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Map edges
  roadmap.edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate the layout
  dagre.layout(dagreGraph);

  // Convert to React Flow nodes with newly calculated positions
  const nodes: RoadmapNode[] = roadmap.nodes.map((node: ApiNode) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const stepInfo = stepNumbers.get(node.id);

    // dagre returns center coordinates, we need top-left for React Flow
    const position = {
      x: nodeWithPosition.x - (NODE_WIDTH / 2),
      y: nodeWithPosition.y - (NODE_HEIGHT / 2),
    };

    return {
      id: node.id,
      type: node.type,
      position,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      data: {
        label: node.label,
        description: node.data.description,
        resources: node.data.resources,
        category: "core" as const,
        phase: (node.data as any).phase || undefined,
        estimatedTime: (node.data as any).estimatedTime || undefined,
        stepNumber: stepInfo?.stepNumber,
        isStartNode: stepInfo?.isStartNode || false,
      },
    };
  });

  // Convert edges referencing top and bottom handles
  const edges: RoadmapEdge[] = roadmap.edges.map((edge) => {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: "source-bottom",
      targetHandle: "target-top",
      type: 'labeled',
      animated: false,
    };
  });

  return { nodes, edges };
}

// Helper to check if message is a roadmap generation request
export function isRoadmapRequest(message: string): boolean {
  const lowerMsg = message.toLowerCase();

  // Exclude question patterns - these are asking ABOUT roadmap, not requesting to CREATE one
  const questionPatterns = [
    "apa ini",
    "ini apa",
    "ini roadmap",
    "roadmap ini",
    "roadmap apa",
    "roadmapnya apa",
    "tentang apa",
    "what is this",
    "what roadmap",
    "this roadmap",
  ];

  if (questionPatterns.some((pattern) => lowerMsg.includes(pattern))) {
    return false;
  }

  // Check for CREATION intent (flexible matching)
  const hasCreateIntent =
    lowerMsg.includes("buat") ||      // buat, buatkan, buatin
    lowerMsg.includes("bikin") ||     // bikin, bikinin
    lowerMsg.includes("create") ||
    lowerMsg.includes("generate") ||
    lowerMsg.includes("ingin belajar") ||
    lowerMsg.includes("mau belajar") ||
    lowerMsg.includes("want to learn") ||
    lowerMsg.includes("cara belajar") ||
    lowerMsg.includes("jalur belajar") ||
    lowerMsg.includes("learning path") ||
    lowerMsg.includes("ajari") ||
    lowerMsg.includes("ajarkan") ||
    lowerMsg.includes("teach me");

  // Must also mention roadmap or learning topic
  const hasRoadmapOrLearning =
    lowerMsg.includes("roadmap") ||
    lowerMsg.includes("belajar");

  return hasCreateIntent && hasRoadmapOrLearning;
}
