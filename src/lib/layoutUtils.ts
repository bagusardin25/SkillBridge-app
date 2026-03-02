import type { RoadmapNode, RoadmapEdge } from "@/types/roadmap";
import type { GeneratedRoadmap, RoadmapNode as ApiNode } from "@/lib/api";

const NODE_WIDTH = 400;
const NODE_HEIGHT = 120;
const NODES_PER_ROW = 4;
const H_GAP = 40;   // horizontal gap between nodes
const V_GAP = 60;   // vertical gap between rows

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

/**
 * Snake/Zig-Zag layout algorithm
 *
 * Row 0 (L→R): [1] → [2] → [3] → [4]
 *                                     │
 * Row 1 (R→L): [8] ← [7] ← [6] ← [5]
 *               │
 * Row 2 (L→R): [9] → [10] → [11] → [12]
 */
function getSnakePosition(index: number): { x: number; y: number } {
  const row = Math.floor(index / NODES_PER_ROW);
  const colInRow = index % NODES_PER_ROW;
  const isReversedRow = row % 2 === 1; // odd rows go right-to-left

  const col = isReversedRow ? (NODES_PER_ROW - 1 - colInRow) : colInRow;

  return {
    x: col * (NODE_WIDTH + H_GAP),
    y: row * (NODE_HEIGHT + V_GAP),
  };
}

/**
 * Determine source and target handle positions for an edge
 * based on the snake layout direction
 */
/**
 * Determine source and target handle IDs for an edge
 * based on the snake layout direction.
 * Handle IDs must match the `id` props on Handle components in CustomNode.
 */
function getEdgeHandleIds(
  sourceIndex: number,
  targetIndex: number
): { sourceHandleId: string; targetHandleId: string } {
  const sourceRow = Math.floor(sourceIndex / NODES_PER_ROW);
  const targetRow = Math.floor(targetIndex / NODES_PER_ROW);

  // If on different rows → vertical connector
  if (sourceRow !== targetRow) {
    return {
      sourceHandleId: "source-bottom",
      targetHandleId: "target-top",
    };
  }

  // Same row: determine direction
  const isReversedRow = sourceRow % 2 === 1;
  if (isReversedRow) {
    // R→L row: source exits Left, target enters Right
    return {
      sourceHandleId: "source-left",
      targetHandleId: "target-right",
    };
  } else {
    // L→R row: source exits Right, target enters Left
    return {
      sourceHandleId: "source-right",
      targetHandleId: "target-left",
    };
  }
}

export function convertToReactFlowNodes(
  roadmap: GeneratedRoadmap
): { nodes: RoadmapNode[]; edges: RoadmapEdge[] } {
  // Calculate step numbers
  const stepNumbers = calculateStepNumbers(roadmap.nodes);

  // Build a map from node ID to its sequential index
  const nodeIdToIndex = new Map<string, number>();
  roadmap.nodes.forEach((node, index) => {
    nodeIdToIndex.set(node.id, index);
  });

  // Convert to React Flow nodes with snake positions
  const nodes: RoadmapNode[] = roadmap.nodes.map((node: ApiNode, index: number) => {
    const position = getSnakePosition(index);
    const stepInfo = stepNumbers.get(node.id);

    return {
      id: node.id,
      type: node.type,
      position,
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

  // Convert edges with correct handle IDs for snake routing
  const edges: RoadmapEdge[] = roadmap.edges.map((edge) => {
    const sourceIdx = nodeIdToIndex.get(edge.source) ?? 0;
    const targetIdx = nodeIdToIndex.get(edge.target) ?? 0;
    const { sourceHandleId, targetHandleId } = getEdgeHandleIds(sourceIdx, targetIdx);

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: sourceHandleId,
      targetHandle: targetHandleId,
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
